/**
 * Deploys testnet contracts (Test_d4e7_*) to Sepolia, Flare, and BSC Testnet.
 * Pads nonces to 23 on all chains so contract addresses match.
 *
 * Usage:
 *   npx hardhat run scripts/deploy-testnet.ts --network sepolia
 *   npx hardhat run scripts/deploy-testnet.ts --network flare
 *   npx hardhat run scripts/deploy-testnet.ts --network bscTestnet
 */

import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const TARGET_NONCE = 23;

async function padNonce(deployer: any, currentNonce: number) {
  if (currentNonce >= TARGET_NONCE) {
    console.log(`  Nonce already at ${currentNonce}, no padding needed`);
    return;
  }

  const needed = TARGET_NONCE - currentNonce;
  console.log(`  Padding nonce from ${currentNonce} to ${TARGET_NONCE} (${needed} self-transfers)...`);

  for (let i = 0; i < needed; i++) {
    const feeData = await deployer.provider!.getFeeData();
    const tx = await deployer.sendTransaction({
      to: deployer.address,
      value: 0,
      nonce: currentNonce + i,
      gasPrice: feeData.gasPrice ? feeData.gasPrice * 2n : undefined
    });
    if (i % 5 === 0 || i === needed - 1) {
      await tx.wait();
      process.stdout.write(`  ${currentNonce + i + 1}/${TARGET_NONCE}\n`);
    }
  }

  const finalNonce = await deployer.getNonce();
  console.log(`  Nonce padded to ${finalNonce}`);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log(`\nChain: ${network.name} (${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)}`);

  // Signer for mint signatures
  const signerKey = process.env.SIGNER_PRIVATE_KEY!;
  const signerWallet = new ethers.Wallet(signerKey);
  console.log(`Signer: ${signerWallet.address}`);

  // Flare mainnet is the whitelist network
  const isWhitelistNetwork = network.chainId === 14n;
  console.log(`Whitelist network: ${isWhitelistNetwork}`);

  // Step 1: Pad nonce to TARGET_NONCE
  console.log(`\n--- Step 1: Nonce Padding ---`);
  const currentNonce = await deployer.getNonce();
  await padNonce(deployer, currentNonce);

  // Step 2: Deploy Test_d4e7_Nodes (nonce 23)
  console.log(`\n--- Step 2: Deploy Test_d4e7_Nodes (nonce ${TARGET_NONCE}) ---`);
  const Nodes = await ethers.getContractFactory("Test_d4e7_Nodes");
  const nodes = await Nodes.deploy(
    isWhitelistNetwork,
    signerWallet.address,
    deployer.address,
    ""
  );
  await nodes.waitForDeployment();
  const nodesAddr = await nodes.getAddress();
  console.log(`  Test_d4e7_Nodes: ${nodesAddr}`);

  // Step 3: Deploy Test_d4e7_Escrow (nonce 24) — passes main contract address
  console.log(`\n--- Step 3: Deploy Test_d4e7_Escrow (nonce ${TARGET_NONCE + 1}) ---`);
  const Escrow = await ethers.getContractFactory("Test_d4e7_Escrow");
  const escrow = await Escrow.deploy(nodesAddr);
  await escrow.waitForDeployment();
  const escrowAddr = await escrow.getAddress();
  console.log(`  Test_d4e7_Escrow: ${escrowAddr}`);

  // Step 4: Deploy Test_d4e7_Bridge (nonce 25) — passes main contract address
  console.log(`\n--- Step 4: Deploy Test_d4e7_Bridge (nonce ${TARGET_NONCE + 2}) ---`);
  const Bridge = await ethers.getContractFactory("Test_d4e7_Bridge");
  const bridge = await Bridge.deploy(nodesAddr);
  await bridge.waitForDeployment();
  const bridgeAddr = await bridge.getAddress();
  console.log(`  Test_d4e7_Bridge: ${bridgeAddr}`);

  // Step 5: Wire up escrow addresses
  console.log(`\n--- Step 5: Wiring escrows ---`);
  await (await nodes.setOneTimeNodeEscrow(escrowAddr)).wait();
  console.log(`  Node escrow set`);
  await (await nodes.setOneTimeCrossChainEscrow(bridgeAddr)).wait();
  console.log(`  Bridge escrow set`);

  // Step 6: Unpause
  console.log(`\n--- Step 6: Unpausing ---`);
  await (await nodes.setPaused(false)).wait();
  console.log(`  Minting unpaused`);

  console.log(`\n========================================`);
  console.log(`  DEPLOYMENT COMPLETE`);
  console.log(`========================================`);
  console.log(`  Chain:            ${network.name} (${network.chainId})`);
  console.log(`  Test_d4e7_Nodes:  ${nodesAddr}`);
  console.log(`  Test_d4e7_Escrow: ${escrowAddr}`);
  console.log(`  Test_d4e7_Bridge: ${bridgeAddr}`);
  console.log(`  Signer:           ${signerWallet.address}`);
  console.log(`  Whitelist:        ${isWhitelistNetwork}`);
  console.log(`========================================\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
