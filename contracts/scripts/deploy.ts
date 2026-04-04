import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log(`Deploying contracts on chain ${network.chainId} with account: ${deployer.address}`);
  console.log(`Account balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))}`);

  // 1. Deploy BridgeEscrow first (no dependencies)
  console.log("\n1. Deploying EXPL_BridgeEscrow...");
  const BridgeEscrow = await ethers.getContractFactory("explorills_BridgeEscrow");
  const bridgeEscrow = await BridgeEscrow.deploy();
  await bridgeEscrow.waitForDeployment();
  const bridgeEscrowAddr = await bridgeEscrow.getAddress();
  console.log(`   EXPL_BridgeEscrow deployed at: ${bridgeEscrowAddr}`);

  // 2. Deploy NodeEscrow (no dependencies)
  console.log("\n2. Deploying EXPL_NodeEscrow...");
  const NodeEscrow = await ethers.getContractFactory("explorills_NodeEscrow");
  const nodeEscrow = await NodeEscrow.deploy();
  await nodeEscrow.waitForDeployment();
  const nodeEscrowAddr = await nodeEscrow.getAddress();
  console.log(`   EXPL_NodeEscrow deployed at: ${nodeEscrowAddr}`);

  // 3. Deploy main Nodes contract (references escrow addresses)
  console.log("\n3. Deploying EXPL_Nodes...");
  const Nodes = await ethers.getContractFactory("explorills_Nodes");
  const nodes = await Nodes.deploy();
  await nodes.waitForDeployment();
  const nodesAddr = await nodes.getAddress();
  console.log(`   EXPL_Nodes deployed at: ${nodesAddr}`);

  console.log("\n--- Deployment Summary ---");
  console.log(`Chain ID:           ${network.chainId}`);
  console.log(`EXPL_Nodes:         ${nodesAddr}`);
  console.log(`EXPL_NodeEscrow:    ${nodeEscrowAddr}`);
  console.log(`EXPL_BridgeEscrow:  ${bridgeEscrowAddr}`);
  console.log(`Deployer:           ${deployer.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
