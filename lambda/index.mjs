import { ethers } from 'ethers';
import axios from 'axios';

// ---- Adapter imports (swapped based on LOCAL_MODE) ----
let dynamodb, secretsClient;

if (process.env.LOCAL_MODE === 'true') {
    const { LocalDynamoDB, LocalSecretsManager } = await import('./local-adapters.mjs');
    dynamodb = new LocalDynamoDB();
    secretsClient = new LocalSecretsManager();
    console.log('[LOCAL MODE] Using in-memory DynamoDB and env-based signer');
} else {
    const { DynamoDB } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocument } = await import('@aws-sdk/lib-dynamodb');
    const { SecretsManagerClient } = await import('@aws-sdk/client-secrets-manager');
    dynamodb = DynamoDBDocument.from(new DynamoDB());
    secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION || "us-east-1" });
}

// ---- Response helper ----
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

// ---- Timestamp helpers ----
function getCurrentTimestamp() {
    return Date.now();
}

function getSignatureTimestamp(expiryTimestamp) {
    return Math.floor(expiryTimestamp / 1000) - 420;
}

// ---- Configuration ----
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'NodeMintQueue';
const QUEUE_TIMEOUT = 60000;

const SUPPLY_ABI = [
    "function a1CurrentChainTnftSupply() external view returns (uint256)",
    "function a2OtherChainsTnftSupply() external view returns (uint256)",
    "function getBatchPriceInUSD(uint256 startId, uint256 endId) external pure returns (uint256)",
    "function whitelistMintedCount() external view returns (uint256)"
];

const ETH_NODE_CONFIG = {
    rpc: process.env.ETH_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/QaamYH_yJ2Kv6q20jiJKEHF7ooR2AQ5s",
    contractAddress: process.env.ETH_CONTRACT_ADDRESS || "0x468F1F91fc674e0161533363B13c2ccBE3769981",
    abi: SUPPLY_ABI
};

const FLARE_NODE_CONFIG = {
    rpc: process.env.FLARE_RPC_URL || "https://flare-api.flare.network/ext/bc/C/rpc",
    contractAddress: process.env.FLARE_CONTRACT_ADDRESS || "0x468F1F91fc674e0161533363B13c2ccBE3769981",
    abi: SUPPLY_ABI
};

const BSC_NODE_CONFIG = {
    rpc: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/",
    contractAddress: process.env.BSC_CONTRACT_ADDRESS || "0x468F1F91fc674e0161533363B13c2ccBE3769981",
    abi: SUPPLY_ABI
};

const FLARE_PRICE_CONFIG = {
    httpRpc: process.env.FLARE_RPC_URL || "https://flare-api.flare.network/ext/bc/C/rpc",
    contractAddress: process.env.FLARE_PRICE_FEED_CONTRACT || "0xB18d3A5e5A85C65cE47f977D7F486B79F99D3d32",
    abi: ["function getFeedsByIndex(uint256[] _indices) external view returns (uint256[] _values, int8[] _decimals, uint64 _timestamp)"]
};

const CMC_API_KEY = process.env.CMC_API_KEY || 'cc50e0f6-a6e3-4261-9dc7-d85000960c86';

// ---- Signer key ----
async function getSignerKey() {
    if (process.env.LOCAL_MODE === 'true') {
        return process.env.SIGNER_PRIVATE_KEY;
    }
    const { GetSecretValueCommand } = await import('@aws-sdk/client-secrets-manager');
    const command = new GetSecretValueCommand({
        SecretId: "NodeSignatureGeneratorPrivateKey"
    });
    const response = await secretsClient.send(command);
    const secretData = JSON.parse(response.SecretString);
    return secretData.NodeSignatureSignerSecretKey;
}

// ---- Price feeds ----
async function fetchPrices() {
    // In local mode, return mock prices
    if (process.env.LOCAL_MODE === 'true') {
        return {
            flrPrice: Number(process.env.MOCK_FLR_PRICE || '0.02'),
            ethPrice: Number(process.env.MOCK_ETH_PRICE || '3000'),
            bnbPrice: Number(process.env.MOCK_BNB_PRICE || '600')
        };
    }

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
            ethPrice: Number(ethers.utils.formatUnits(feeds[1], decimals[1])),
            bnbPrice: await fetchBnbPrice()
        };
    } catch (error) {
        return fetchPricesFromCMC();
    }
}

async function fetchBnbPrice() {
    try {
        const response = await axios.get(
            'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
            {
                params: { symbol: 'BNB', convert: 'USD' },
                headers: { 'X-CMC_PRO_API_KEY': CMC_API_KEY }
            }
        );
        return response.data.data.BNB.quote.USD.price;
    } catch (error) {
        console.error('Failed to fetch BNB price:', error.message);
        return 600; // fallback
    }
}

async function fetchPricesFromCMC() {
    const response = await axios.get(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
        {
            params: { symbol: 'FLR,ETH,BNB', convert: 'USD' },
            headers: { 'X-CMC_PRO_API_KEY': CMC_API_KEY }
        }
    );
    const { data } = response.data;
    return {
        flrPrice: data.FLR.quote.USD.price,
        ethPrice: data.ETH.quote.USD.price,
        bnbPrice: data.BNB.quote.USD.price
    };
}

// ---- Chain supply reads (3-chain) ----
async function getChainSupplies() {
    const ethProvider = new ethers.providers.JsonRpcProvider(ETH_NODE_CONFIG.rpc);
    const flareProvider = new ethers.providers.JsonRpcProvider(FLARE_NODE_CONFIG.rpc);
    const bscProvider = new ethers.providers.JsonRpcProvider(BSC_NODE_CONFIG.rpc);

    const ethContract = new ethers.Contract(ETH_NODE_CONFIG.contractAddress, ETH_NODE_CONFIG.abi, ethProvider);
    const flareContract = new ethers.Contract(FLARE_NODE_CONFIG.contractAddress, FLARE_NODE_CONFIG.abi, flareProvider);
    const bscContract = new ethers.Contract(BSC_NODE_CONFIG.contractAddress, BSC_NODE_CONFIG.abi, bscProvider);

    const [
        ethSupply, ethOtherChainSupply,
        flareSupply, flareOtherChainSupply, whitelistMinted,
        bscSupply, bscOtherChainSupply
    ] = await Promise.all([
        ethContract.a1CurrentChainTnftSupply(),
        ethContract.a2OtherChainsTnftSupply(),
        flareContract.a1CurrentChainTnftSupply(),
        flareContract.a2OtherChainsTnftSupply(),
        flareContract.whitelistMintedCount(),
        bscContract.a1CurrentChainTnftSupply(),
        bscContract.a2OtherChainsTnftSupply()
    ]);

    // Total actual minted across all chains (excluding whitelist reserve double-count)
    const totalSupply = ethSupply.add(flareSupply).add(bscSupply).sub(whitelistMinted);

    return {
        ethSupply,
        ethOtherChainSupply,
        flareSupply,
        flareOtherChainSupply,
        whitelistMinted,
        bscSupply,
        bscOtherChainSupply,
        totalSupply
    };
}

// ---- Queue operations ----
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

// ---- Main handler ----
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
                    await dynamodb.update({
                        TableName: TABLE_NAME,
                        Key: { address, randomNonce },
                        UpdateExpression: 'SET #status = :status',
                        ConditionExpression: 'attribute_exists(address) AND attribute_exists(randomNonce)',
                        ExpressionAttributeNames: { '#status': 'status' },
                        ExpressionAttributeValues: { ':status': statusUpdate }
                    });
                } else {
                    await dynamodb.update({
                        TableName: TABLE_NAME,
                        Key: { address, randomNonce },
                        UpdateExpression: 'SET #status = :status, concluded = :concluded, queuePosition = :queuePosition, expiryTimestamp = :expiryTimestamp',
                        ConditionExpression: 'attribute_exists(address) AND attribute_exists(randomNonce)',
                        ExpressionAttributeNames: { '#status': 'status' },
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

                return createResponse(200, { success: true, queueData });
            } catch (error) {
                if (error.name === 'ConditionalCheckFailedException') {
                    return createResponse(409, { error: 'Queue entry not found', queueData });
                }
                throw error;
            }
        }

        // Mint request handling
        if (mintAmount) {
            try {
                console.log('Starting mint request handling:', { address, network, randomNonce, mintAmount });

                queueData = await getQueueData(network);
                const hasExpiredEntries = await handleExpiredEntries(queueData);
                if (hasExpiredEntries) {
                    queueData = await getQueueData(network);
                    await updateQueuePositions(queueData, network);
                    queueData = await getQueueData(network);
                }

                const anyExistingEntry = queueData.find(entry =>
                    entry.address.toLowerCase() === address.toLowerCase() &&
                    entry.randomNonce === randomNonce
                );

                if (anyExistingEntry) {
                    if (anyExistingEntry.concluded) {
                        await updateQueuePositions(queueData, network);
                        queueData = await getQueueData(network);
                        return createResponse(200, { queueData });
                    }

                    await updateQueuePositions(queueData, network);
                    queueData = await getQueueData(network);

                    const updatedEntry = queueData.find(entry =>
                        !entry.concluded &&
                        entry.address.toLowerCase() === address.toLowerCase() &&
                        entry.randomNonce === randomNonce
                    );

                    if (updatedEntry.queuePosition === '1' && updatedEntry.status === 'inQueue') {
                        await dynamodb.update({
                            TableName: TABLE_NAME,
                            Key: { address, randomNonce },
                            UpdateExpression: 'SET #status = :status',
                            ExpressionAttributeNames: { '#status': 'status' },
                            ExpressionAttributeValues: { ':status': 'waiting-user-confirmation' }
                        });
                        queueData = await getQueueData(network);
                    }
                } else {
                    await handleDuplicateAddress(address, network, randomNonce);
                    queueData = await getQueueData(network);

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
                        ExpressionAttributeValues: { ':true': true }
                    });

                    queueData = await getQueueData(network);
                    await updateQueuePositions(queueData, network);
                    queueData = await getQueueData(network);
                }

                // Signature generation
                const shouldGenerateSignature = queueData.find(entry =>
                    entry.address.toLowerCase() === address.toLowerCase() &&
                    entry.randomNonce === randomNonce &&
                    entry.status === 'waiting-user-confirmation' &&
                    entry.queuePosition === '1'
                );

                if (shouldGenerateSignature) {
                    console.log('Generating signature for:', { address, network });

                    const supplies = await getChainSupplies();
                    const prices = await fetchPrices();

                    const startId = supplies.totalSupply.add(1);
                    const endId = startId.add(mintAmount).sub(1);

                    // Use ETH contract for batch price (pricing is pure/same on all chains)
                    const ethProvider = new ethers.providers.JsonRpcProvider(ETH_NODE_CONFIG.rpc);
                    const ethContract = new ethers.Contract(ETH_NODE_CONFIG.contractAddress, ETH_NODE_CONFIG.abi, ethProvider);

                    const priceInUSD = await ethContract.getBatchPriceInUSD(startId, endId);

                    let tokenPrice;
                    if (network === 'Ethereum') {
                        tokenPrice = prices.ethPrice;
                    } else if (network === 'Binance Smart Chain') {
                        tokenPrice = prices.bnbPrice;
                    } else {
                        tokenPrice = prices.flrPrice;
                    }

                    const nativeTokenAmount = Number(priceInUSD) / tokenPrice;
                    const value = ethers.utils.parseEther(nativeTokenAmount.toFixed(18));

                    // Calculate otherChainQty — the 3-chain sync delta
                    let otherChainQty;

                    if (network === 'Ethereum') {
                        const ethOtherChainSupply = supplies.ethOtherChainSupply;
                        const flareCurrentSupply = supplies.flareSupply.sub(supplies.whitelistMinted);
                        const actualOtherSupply = flareCurrentSupply.add(ethers.BigNumber.from(1200)).add(supplies.bscSupply);
                        const difference = actualOtherSupply.sub(ethOtherChainSupply);
                        otherChainQty = difference.gt(0) ? difference : ethers.BigNumber.from(0);
                    } else if (network === 'Binance Smart Chain') {
                        const bscOtherChainSupply = supplies.bscOtherChainSupply;
                        const flareCurrentSupply = supplies.flareSupply.sub(supplies.whitelistMinted);
                        const actualOtherSupply = supplies.ethSupply.add(flareCurrentSupply).add(ethers.BigNumber.from(1200));
                        const difference = actualOtherSupply.sub(bscOtherChainSupply);
                        otherChainQty = difference.gt(0) ? difference : ethers.BigNumber.from(0);
                    } else {
                        // Flare
                        const flareOtherChainSupply = supplies.flareOtherChainSupply;
                        const actualOtherSupply = supplies.ethSupply.add(supplies.bscSupply);
                        const difference = actualOtherSupply.sub(flareOtherChainSupply);
                        otherChainQty = difference.gt(0) ? difference : ethers.BigNumber.from(0);
                    }

                    const signatureTimestamp = getSignatureTimestamp(shouldGenerateSignature.expiryTimestamp);
                    console.log('Signature data:', {
                        network,
                        otherChainQty: otherChainQty.toString(),
                        value: value.toString(),
                        signatureTimestamp
                    });

                    const { signature } = await generateMintSignature(
                        value,
                        otherChainQty,
                        ethers.BigNumber.from(mintAmount),
                        randomNonce,
                        signatureTimestamp
                    );

                    return createResponse(200, {
                        queueData,
                        mintData: {
                            value: value.toString(),
                            otherChainQty: otherChainQty.toString(),
                            mintAmount: mintAmount.toString(),
                            timestamp: signatureTimestamp.toString(),
                            signature
                        }
                    });
                }

                return createResponse(200, { queueData });

            } catch (error) {
                if (error.name === 'ConditionalCheckFailedException') {
                    queueData = await getQueueData(network);
                    return createResponse(200, { queueData });
                }
                console.error('Error in mint request handling:', {
                    message: error.message,
                    stack: error.stack,
                    address, network, randomNonce
                });
                throw error;
            }
        }

        return createResponse(200, { queueData });

    } catch (error) {
        console.error('Error:', error);
        return createResponse(500, { error: 'Internal server error' });
    }
};
