/**
 * Integration test: exercises the Lambda local server against Hardhat contracts.
 *
 * Prerequisites:
 *   1. Hardhat node running: cd contracts && npx hardhat node
 *   2. Contracts deployed: npx hardhat run scripts/deploy-local.ts --network localhost
 *   3. Lambda server running: node local-server.mjs
 *
 * Usage: node test-local.mjs
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });
dotenv.config({ path: resolve(__dirname, '../.env') });

const LAMBDA_URL = `http://localhost:${process.env.LAMBDA_LOCAL_PORT || 3001}`;

const NODE_ABI = [
    "function mint((uint256 otherChainQty, uint256 mintAmount, uint256 timestamp, string randomNonce, bytes signature)) external payable",
    "function a1CurrentChainTnftSupply() external view returns (uint256)",
    "function a2OtherChainsTnftSupply() external view returns (uint256)",
    "function a3GetTotalCurrentSupply() external view returns (uint256)",
    "function a5RemainingNodesToMINT() external view returns (uint256)"
];

function generateNonce() {
    return Math.floor(Math.random() * 1e18).toString().padStart(18, '0');
}

async function callLambda(body) {
    const res = await fetch(LAMBDA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return res.json();
}

async function requestMintSignature(address, mintAmount, network) {
    const nonce = generateNonce();

    // Initial request — joins queue
    let response = await callLambda({ address, mintAmount, network, randomNonce: nonce });

    // If signature not ready yet, poll (in real app, frontend polls every 1s)
    let attempts = 0;
    while (!response.mintData && attempts < 10) {
        await new Promise(r => setTimeout(r, 200));
        response = await callLambda({ address, mintAmount, network, randomNonce: nonce });
        attempts++;
    }

    if (!response.mintData) {
        throw new Error(`No signature after ${attempts} attempts. Queue: ${JSON.stringify(response.queueData)}`);
    }

    return { ...response.mintData, randomNonce: nonce };
}

async function executeMint(contract, signer, mintData) {
    const params = {
        otherChainQty: mintData.otherChainQty,
        mintAmount: mintData.mintAmount,
        timestamp: mintData.timestamp,
        randomNonce: mintData.randomNonce,
        signature: mintData.signature
    };

    const tx = await contract.connect(signer).mint(params, {
        value: ethers.BigNumber.from(mintData.value),
        gasLimit: 500000
    });
    await tx.wait();
    return tx;
}

async function printChainState(label, contract) {
    const a1 = await contract.a1CurrentChainTnftSupply();
    const a2 = await contract.a2OtherChainsTnftSupply();
    const total = await contract.a3GetTotalCurrentSupply();
    const remaining = await contract.a5RemainingNodesToMINT();
    console.log(`  ${label}: a1=${a1} a2=${a2} total=${total} remaining=${remaining}`);
}

// ---- Main test flow ----
async function main() {
    console.log('=== Lambda Integration Test ===\n');

    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');

    // Hardhat default accounts
    const user1 = new ethers.Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', provider);
    const user2 = new ethers.Wallet('0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a', provider);
    const user3 = new ethers.Wallet('0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6', provider);

    const ethContract = new ethers.Contract(process.env.ETH_CONTRACT_ADDRESS, NODE_ABI, provider);
    const flareContract = new ethers.Contract(process.env.FLARE_CONTRACT_ADDRESS, NODE_ABI, provider);
    const bscContract = new ethers.Contract(process.env.BSC_CONTRACT_ADDRESS, NODE_ABI, provider);

    // Verify initial state
    console.log('--- Initial State ---');
    await printChainState('ETH  ', ethContract);
    await printChainState('Flare', flareContract);
    await printChainState('BSC  ', bscContract);

    // Test 1: Mint on ETH
    console.log('\n--- Test 1: Mint 5 on Ethereum ---');
    let mintData = await requestMintSignature(user1.address, 5, 'Ethereum');
    console.log(`  Signature received. otherChainQty=${mintData.otherChainQty} value=${mintData.value}`);
    await executeMint(ethContract, user1, mintData);
    console.log('  Minted successfully!');
    await callLambda({ address: user1.address, randomNonce: mintData.randomNonce, status: 'minted' });
    await printChainState('ETH  ', ethContract);

    // Test 2: Mint on Flare (should sync with ETH)
    console.log('\n--- Test 2: Mint 3 on Flare (should learn about ETH) ---');
    mintData = await requestMintSignature(user2.address, 3, 'Flare');
    console.log(`  Signature received. otherChainQty=${mintData.otherChainQty} (expected: 5)`);
    await executeMint(flareContract, user2, mintData);
    console.log('  Minted successfully!');
    await callLambda({ address: user2.address, randomNonce: mintData.randomNonce, status: 'minted' });
    await printChainState('Flare', flareContract);

    // Test 3: First mint on BSC (should learn about ETH + Flare)
    console.log('\n--- Test 3: Mint 2 on BSC (should learn about ETH + Flare) ---');
    mintData = await requestMintSignature(user3.address, 2, 'Binance Smart Chain');
    console.log(`  Signature received. otherChainQty=${mintData.otherChainQty} (expected: 8)`);
    await executeMint(bscContract, user3, mintData);
    console.log('  Minted successfully!');
    await callLambda({ address: user3.address, randomNonce: mintData.randomNonce, status: 'minted' });
    await printChainState('BSC  ', bscContract);

    // Test 4: ETH mints again (should learn about Flare + BSC)
    console.log('\n--- Test 4: Mint 1 on ETH (should learn about Flare + BSC) ---');
    mintData = await requestMintSignature(user1.address, 1, 'Ethereum');
    console.log(`  Signature received. otherChainQty=${mintData.otherChainQty} (expected: 5)`);
    await executeMint(ethContract, user1, mintData);
    console.log('  Minted successfully!');
    await callLambda({ address: user1.address, randomNonce: mintData.randomNonce, status: 'minted' });

    // Final state
    console.log('\n--- Final State ---');
    await printChainState('ETH  ', ethContract);
    await printChainState('Flare', flareContract);
    await printChainState('BSC  ', bscContract);

    // Verify global consistency
    const ethA1 = await ethContract.a1CurrentChainTnftSupply();
    const flareA1 = await flareContract.a1CurrentChainTnftSupply();
    const bscA1 = await bscContract.a1CurrentChainTnftSupply();
    const totalActual = ethA1.add(flareA1).add(bscA1).toNumber();
    console.log(`\n  Total actually minted across all chains: ${totalActual}`);
    console.log(`  Expected: 11 (5+1 ETH + 3 Flare + 2 BSC)`);
    console.log(`  ${totalActual === 11 ? 'PASS' : 'FAIL'}`);

    console.log('\n=== All tests complete ===');
}

main().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
