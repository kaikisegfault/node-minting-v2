import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { ethers } from 'ethers';
import axios from 'axios';

// Response helper
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};

function createResponse(statusCode, body) {
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
    };
}

// Universal timestamp functions
function getCurrentTimestamp() {
    return Date.now();
}

function getSignatureTimestamp(expiryTimestamp) {
    return Math.floor(expiryTimestamp / 1000) - 420;
}

const dynamodb = DynamoDBDocument.from(new DynamoDB());
const secretsClient = new SecretsManagerClient({ region: "us-east-1" });

const TABLE_NAME = 'NodeMintQueue';
const QUEUE_TIMEOUT = 60000;

const ETH_NODE_CONFIG = {
    rpc: "https://eth-mainnet.g.alchemy.com/v2/QaamYH_yJ2Kv6q20jiJKEHF7ooR2AQ5s",
    contractAddress: "0x468F1F91fc674e0161533363B13c2ccBE3769981",
    abi: [
        "function a1CurrentChainTnftSupply() external view returns (uint256)",
        "function getBatchPriceInUSD(uint256 startId, uint256 endId) external pure returns (uint256)",
        "function a2OtherChainsTnftSupply() external view returns (uint256)"
    ]
};

const FLARE_NODE_CONFIG = {
    rpc: "https://flare-api.flare.network/ext/bc/C/rpc",
    contractAddress: "0x468F1F91fc674e0161533363B13c2ccBE3769981",
    abi: [
        "function a1CurrentChainTnftSupply() external view returns (uint256)",
        "function whitelistMintedCount() external view returns (uint256)",
        "function a2OtherChainsTnftSupply() external view returns (uint256)"
    ]
};

const FLARE_PRICE_CONFIG = {
    httpRpc: "https://flare-api.flare.network/ext/bc/C/rpc",
    contractAddress: "0xB18d3A5e5A85C65cE47f977D7F486B79F99D3d32",
    abi: ["function getFeedsByIndex(uint256[] _indices) external view returns (uint256[] _values, int8[] _decimals, uint64 _timestamp)"]
};
async function getSignerKey() {
    const command = new GetSecretValueCommand({
        SecretId: "NodeSignatureGeneratorPrivateKey"
    });
    const response = await secretsClient.send(command);
    const secretData = JSON.parse(response.SecretString);
    return secretData.NodeSignatureSignerSecretKey;
}

async function fetchPrices() {
    try {
        const provider = new ethers.providers.JsonRpcProvider(FLARE_PRICE_CONFIG.httpRpc);
        const contract = new ethers.Contract(
            FLARE_PRICE_CONFIG.contractAddress,
            FLARE_PRICE_CONFIG.abi,
            provider
        );

        const [feeds, decimals] = await contract.getFeedsByIndex([0, 9]);
        return {
            flrPrice: Number(ethers.utils.formatUnits(feeds[0], decimals[0])),
            ethPrice: Number(ethers.utils.formatUnits(feeds[1], decimals[1]))
        };
    } catch (error) {
        return fetchPricesFromCMC();
    }
}

async function fetchPricesFromCMC() {
    const response = await axios.get(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
        {
            params: { symbol: 'FLR,ETH', convert: 'USD' },
            headers: { 'X-CMC_PRO_API_KEY': 'cc50e0f6-a6e3-4261-9dc7-d85000960c86' }
        }
    );
    const { data } = response.data;
    return {
        flrPrice: data.FLR.quote.USD.price,
        ethPrice: data.ETH.quote.USD.price
    };
}

// This is the critical change needed to fetch both current and other chain supplies
async function getChainSupplies() {
    const ethProvider = new ethers.providers.JsonRpcProvider(ETH_NODE_CONFIG.rpc);
    const flareProvider = new ethers.providers.JsonRpcProvider(FLARE_NODE_CONFIG.rpc);

    const ethContract = new ethers.Contract(
        ETH_NODE_CONFIG.contractAddress,
        ETH_NODE_CONFIG.abi,
        ethProvider
    );
    const flareContract = new ethers.Contract(
        FLARE_NODE_CONFIG.contractAddress,
        FLARE_NODE_CONFIG.abi,
        flareProvider
    );

    const [ethSupply, ethOtherChainSupply, flareSupply, flareOtherChainSupply, whitelistMinted] = await Promise.all([
        ethContract.a1CurrentChainTnftSupply(),
        ethContract.a2OtherChainsTnftSupply(),
        flareContract.a1CurrentChainTnftSupply(),
        flareContract.a2OtherChainsTnftSupply(),
        flareContract.whitelistMintedCount()
    ]);

    return {
        ethSupply,
        ethOtherChainSupply,
        flareSupply,
        flareOtherChainSupply,
        whitelistMinted,
        totalSupply: ethSupply.add(flareSupply).sub(whitelistMinted)
    };
}
async function getQueueData(network) {
    const { Items = [] } = await dynamodb.scan({
        TableName: TABLE_NAME,
        ConsistentRead: true
    });
    return Items.filter(item => item.network === network);
}

async function generateMintSignature(value, otherChainQty, mintAmount, randomNonce, signatureTimestamp) {
    const signerKey = await getSignerKey();
    const wallet = new ethers.Wallet(signerKey);

    const formattedTimestamp = ethers.BigNumber.from(signatureTimestamp);

    const messageHash = ethers.utils.keccak256(
        ethers.utils.solidityPack(
            ['uint256', 'uint256', 'uint256', 'uint256', 'string'],
            [value, otherChainQty, mintAmount, formattedTimestamp, randomNonce]
        )
    );

    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));
    return { signature, signatureTimestamp };
}

async function updateQueuePositions(queueData, network) {
    const activeEntries = queueData
        .filter(entry =>
            !entry.concluded &&
            ['inQueue', 'waiting-user-confirmation', 'waiting-receipt'].includes(entry.status)
        )
        .sort((a, b) => a.initialTimestamp - b.initialTimestamp);

    const updates = activeEntries.map((entry, index) => {
        const position = (index + 1).toString();
        const isFirst = index === 0;

        // ONLY assign timestamp if:
        // 1. It's first position
        // 2. Status is inQueue
        // 3. NO existing timestamp (null or undefined)
        const expiryTimestamp = isFirst && entry.status === 'inQueue' && !entry.expiryTimestamp ?
            getCurrentTimestamp() : entry.expiryTimestamp;

        return {
            Put: {
                TableName: TABLE_NAME,
                Item: {
                    ...entry,
                    queuePosition: position,
                    expiryTimestamp
                },
                ConditionExpression: 'attribute_exists(address) AND attribute_exists(randomNonce)'
            }
        };
    });

    if (updates.length > 0) {
        await dynamodb.transactWrite({ TransactItems: updates });
    }

    return activeEntries;
}

async function handleExpiredEntries(queueData) {
    const currentTime = getCurrentTimestamp();
    const expiredUpdates = queueData
        .filter(entry =>
            !entry.concluded &&
            entry.queuePosition === '1' &&
            entry.expiryTimestamp &&
            (currentTime - entry.expiryTimestamp > QUEUE_TIMEOUT)
        )
        .map(entry => ({
            Put: {
                TableName: TABLE_NAME,
                Item: {
                    ...entry,
                    status: 'expired',
                    concluded: true,
                    queuePosition: 'concluded',
                    expiryTimestamp: 'concluded'
                },
                ConditionExpression: 'attribute_exists(address) AND attribute_exists(randomNonce)'
            }
        }));

    if (expiredUpdates.length > 0) {
        await dynamodb.transactWrite({ TransactItems: expiredUpdates });
        return true;
    }
    return false;
}

async function handleDuplicateAddress(address, network, randomNonce) {
    const queueData = await getQueueData(network);
    // First find ANY entry with same address and DIFFERENT nonce
    const duplicateEntry = queueData.find(entry =>
        !entry.concluded &&
        entry.address.toLowerCase() === address.toLowerCase() &&
        entry.randomNonce !== randomNonce
    );

    if (duplicateEntry) {
        await dynamodb.delete({
            TableName: TABLE_NAME,
            Key: {
                address: duplicateEntry.address,
                randomNonce: duplicateEntry.randomNonce
            },
            ConditionExpression: 'attribute_exists(address) AND attribute_exists(randomNonce)'
        });

        const updatedQueueData = await getQueueData(network);
        await updateQueuePositions(updatedQueueData, network);
        return true;
    }
    return false;
}


export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { address, mintAmount, network, randomNonce, status: statusUpdate } = body;

        if (!address || !randomNonce || randomNonce.length !== 18) {
            return createResponse(400, { error: 'Invalid input parameters' });
        }

        let queueData = await getQueueData(network);

        // Handle expired entries
        const hasExpiredEntries = await handleExpiredEntries(queueData);
        if (hasExpiredEntries) {
            queueData = await getQueueData(network);
        }

        if (statusUpdate) {
            try {
                const isTerminalStatus = ['minted', 'rejected', 'failed', 'expired'].includes(statusUpdate);

                if (statusUpdate === 'waiting-receipt') {
                    // Only update status for waiting-receipt
                    await dynamodb.update({
                        TableName: TABLE_NAME,
                        Key: {
                            address,
                            randomNonce
                        },
                        UpdateExpression: 'SET #status = :status',
                        ConditionExpression: 'attribute_exists(address) AND attribute_exists(randomNonce)',
                        ExpressionAttributeNames: {
                            '#status': 'status'
                        },
                        ExpressionAttributeValues: {
                            ':status': statusUpdate
                        }
                    });
                } else {
                    // Keep original behavior for all other statuses
                    await dynamodb.update({
                        TableName: TABLE_NAME,
                        Key: {
                            address,
                            randomNonce
                        },
                        UpdateExpression: 'SET #status = :status, concluded = :concluded, queuePosition = :queuePosition, expiryTimestamp = :expiryTimestamp',
                        ConditionExpression: 'attribute_exists(address) AND attribute_exists(randomNonce)',
                        ExpressionAttributeNames: {
                            '#status': 'status'
                        },
                        ExpressionAttributeValues: {
                            ':status': statusUpdate,
                            ':concluded': isTerminalStatus,
                            ':queuePosition': isTerminalStatus ? 'concluded' : null,
                            ':expiryTimestamp': isTerminalStatus ? 'concluded' : null
                        }
                    });
                }
                if (isTerminalStatus) {
                    queueData = await getQueueData(network);
                    await updateQueuePositions(queueData, network);
                }

                return createResponse(200, {
                    success: true,
                    queueData: queueData
                });
            } catch (error) {
                if (error.name === 'ConditionalCheckFailedException') {
                    return createResponse(409, {
                        error: 'Queue entry not found',
                        queueData: queueData
                    });
                }
                throw error;
            }
        }

        // In the mint request handling section:
        if (mintAmount) {
            try {
                console.log('Starting mint request handling:', { address, network, randomNonce, mintAmount });

                // FIRST: Always handle expired entries, including if requester's entry is expired
                queueData = await getQueueData(network);
                const hasExpiredEntries = await handleExpiredEntries(queueData);
                if (hasExpiredEntries) {
                    queueData = await getQueueData(network);
                    await updateQueuePositions(queueData, network);
                    queueData = await getQueueData(network);
                }

                // First check if ANY entry exists with same address+nonce (including expired/concluded)
                const anyExistingEntry = queueData.find(entry =>
                    entry.address.toLowerCase() === address.toLowerCase() &&
                    entry.randomNonce === randomNonce
                );

                if (anyExistingEntry) {
                    // If entry exists but is concluded, update queue positions first
                    if (anyExistingEntry.concluded) {
                        await updateQueuePositions(queueData, network);
                        queueData = await getQueueData(network);
                        return createResponse(200, {
                            queueData: queueData
                        });
                    }
                    // If entry exists and is not concluded, continue with normal flow
                    await updateQueuePositions(queueData, network);
                    queueData = await getQueueData(network);

                    // Then check if it's in first position
                    const updatedEntry = queueData.find(entry =>
                        !entry.concluded &&
                        entry.address.toLowerCase() === address.toLowerCase() &&
                        entry.randomNonce === randomNonce
                    );

                    if (updatedEntry.queuePosition === '1' && updatedEntry.status === 'inQueue') {
                        await dynamodb.update({
                            TableName: TABLE_NAME,
                            Key: {
                                address,
                                randomNonce
                            },
                            UpdateExpression: 'SET #status = :status',
                            ExpressionAttributeNames: {
                                '#status': 'status'
                            },
                            ExpressionAttributeValues: {
                                ':status': 'waiting-user-confirmation'
                            }
                        });
                        queueData = await getQueueData(network);
                    }
                } else {
                    // Different address or nonce - handle duplicate and create new entry
                    await handleDuplicateAddress(address, network, randomNonce);
                    queueData = await getQueueData(network);

                    // Create new entry
                    const activeEntries = queueData.filter(entry => !entry.concluded);
                    const newEntry = {
                        address,
                        quantity: mintAmount,
                        queuePosition: activeEntries.length === 0 ? '1' : (activeEntries.length + 1).toString(),
                        status: activeEntries.length === 0 ? 'waiting-user-confirmation' : 'inQueue',
                        initialTimestamp: getCurrentTimestamp(),
                        expiryTimestamp: activeEntries.length === 0 ? getCurrentTimestamp() : null,
                        network,
                        randomNonce,
                        concluded: false
                    };

                    await dynamodb.put({
                        TableName: TABLE_NAME,
                        Item: newEntry,
                        ConditionExpression: 'attribute_not_exists(address) OR concluded = :true',
                        ExpressionAttributeValues: {
                            ':true': true
                        }
                    });

                    queueData = await getQueueData(network);
                    await updateQueuePositions(queueData, network);
                    queueData = await getQueueData(network);
                }

                // Final check for signature generation
                const shouldGenerateSignature = queueData.find(entry =>
                    entry.address.toLowerCase() === address.toLowerCase() &&
                    entry.randomNonce === randomNonce &&
                    entry.status === 'waiting-user-confirmation' &&
                    entry.queuePosition === '1'
                );

                if (shouldGenerateSignature) {
                    console.log('Generating signature with entry:', shouldGenerateSignature);

                    // Fetch all required data for signature
                    const supplies = await getChainSupplies();
                    const prices = await fetchPrices();

                    // Calculate signature timestamp from entry's expiryTimestamp

                    const startId = supplies.totalSupply.add(1);
                    const endId = startId.add(mintAmount).sub(1);

                    const ethProvider = new ethers.providers.JsonRpcProvider(ETH_NODE_CONFIG.rpc);
                    const ethContract = new ethers.Contract(
                        ETH_NODE_CONFIG.contractAddress,
                        ETH_NODE_CONFIG.abi,
                        ethProvider
                    );

                    const priceInUSD = await ethContract.getBatchPriceInUSD(startId, endId);
                    const tokenPrice = network === 'Ethereum' ? prices.ethPrice : prices.flrPrice;

                    const nativeTokenAmount = Number(priceInUSD) / tokenPrice;
                    const value = ethers.utils.parseEther(nativeTokenAmount.toFixed(18));

                    let otherChainQty;
                    if (network === 'Ethereum') {
                        // ETH logic as before
                        const ethOtherChainSupply = supplies.ethOtherChainSupply;
                        const flareCurrentSupply = supplies.flareSupply.sub(supplies.whitelistMinted);
                        const difference = flareCurrentSupply.add(ethers.BigNumber.from(1200)).sub(ethOtherChainSupply);
                        otherChainQty = difference.gt(0) ? difference : ethers.BigNumber.from(0);
                    } else {
                        // Flare logic
                        const flareOtherChainSupply = supplies.flareOtherChainSupply;
                        const ethCurrentSupply = supplies.ethSupply;
                        const difference = ethCurrentSupply.sub(flareOtherChainSupply);
                        otherChainQty = difference.gt(0) ? difference : ethers.BigNumber.from(0);
                    }

                    const signatureTimestamp = getSignatureTimestamp(shouldGenerateSignature.expiryTimestamp);
                        console.log('Signature generation data:', {
                            expiryTimestamp: shouldGenerateSignature.expiryTimestamp,
                            calculatedSignatureTimestamp: signatureTimestamp
                        });

                    const { signature } = await generateMintSignature(
                        value,
                        otherChainQty,
                        ethers.BigNumber.from(mintAmount),
                        randomNonce,
                        signatureTimestamp
                    );

                    return createResponse(200, {
                        queueData: queueData,
                        mintData: {
                            value: value.toString(),
                            otherChainQty: otherChainQty.toString(),
                            mintAmount: mintAmount.toString(),
                            timestamp: signatureTimestamp.toString(),
                            signature
                        }
                    });
                }

                // Return just queue data if no signature needed
                return createResponse(200, {
                    queueData: queueData
                });

            } catch (error) {
                if (error.name === 'ConditionalCheckFailedException') {
                    queueData = await getQueueData(network);
                    return createResponse(200, {
                        queueData: queueData
                    });
                }
                console.error('Error in mint request handling:', {
                    message: error.message,
                    stack: error.stack,
                    errorName: error.name,
                    address,
                    network,
                    randomNonce
                });
                throw error;
            }
        }

        return createResponse(200, {
            queueData: queueData
        });

    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
            queueData = await getQueueData(network);
            return createResponse(200, {
                queueData: queueData
            });
        }
        console.error('Error:', error);
        return createResponse(500, {
            error: 'Internal server error'
        });
    }
};
