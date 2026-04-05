import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log(`\nDeploying on chain ${network.chainId} with deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))}`);

  // Signer and operator — MUST match ETH/Flare deployments exactly
  const signerPublicKey = "0xE628Acef67489760B9b87185Afc01734879cf08e";
  const crossChainOperator = "0x5c89fB9E0dd21bD7A2fe7A165e7aE676B89079Dc";

  // Flare is the whitelist network; ETH and BSC are not
  const isWhitelistNetwork = network.chainId === 14n || network.chainId === 114n;
  const baseURI = "ipfs://QmYHqyjayx2BcpvCjBbFuC1h2jY3fTkvgFJ14YPaAKZiNe/";

  console.log(`isWhitelistNetwork: ${isWhitelistNetwork}`);

  // DEPLOY ORDER MATTERS: must match ETH/Flare deployment nonces
  // Nonce 0: EXPL_Nodes
  // Nonce 1: EXPL_NodeEscrow
  // Nonce 2: EXPL_BridgeEscrow

  // 1. Deploy EXPL_Nodes (nonce 0)
  console.log("\n1. Deploying EXPL_Nodes...");
  const Nodes = await ethers.getContractFactory("explorills_Nodes");
  const nodes = await Nodes.deploy(isWhitelistNetwork, signerPublicKey, crossChainOperator, baseURI);
  await nodes.waitForDeployment();
  const nodesAddr = await nodes.getAddress();
  console.log(`   EXPL_Nodes: ${nodesAddr}`);

  // 2. Deploy EXPL_NodeEscrow (nonce 1)
  console.log("\n2. Deploying EXPL_NodeEscrow...");
  const NodeEscrow = await ethers.getContractFactory("explorills_NodeEscrow");
  const nodeEscrow = await NodeEscrow.deploy();
  await nodeEscrow.waitForDeployment();
  const nodeEscrowAddr = await nodeEscrow.getAddress();
  console.log(`   EXPL_NodeEscrow: ${nodeEscrowAddr}`);

  // 3. Deploy EXPL_BridgeEscrow (nonce 2)
  console.log("\n3. Deploying EXPL_BridgeEscrow...");
  const BridgeEscrow = await ethers.getContractFactory("explorills_BridgeEscrow");
  const bridgeEscrow = await BridgeEscrow.deploy();
  await bridgeEscrow.waitForDeployment();
  const bridgeEscrowAddr = await bridgeEscrow.getAddress();
  console.log(`   EXPL_BridgeEscrow: ${bridgeEscrowAddr}`);

  // 4. Wire up escrow addresses on main contract
  console.log("\n4. Setting escrow addresses on EXPL_Nodes...");
  await (await nodes.setOneTimeNodeEscrow(nodeEscrowAddr)).wait();
  console.log(`   Node escrow set: ${nodeEscrowAddr}`);
  await (await nodes.setOneTimeCrossChainEscrow(bridgeEscrowAddr)).wait();
  console.log(`   Bridge escrow set: ${bridgeEscrowAddr}`);

  // 5. Unpause minting
  console.log("\n5. Unpausing minting...");
  await (await nodes.setPaused(false)).wait();
  console.log("   Minting unpaused");

  console.log("\n=== Deployment Summary ===");
  console.log(`Chain ID:           ${network.chainId}`);
  console.log(`EXPL_Nodes:         ${nodesAddr}`);
  console.log(`EXPL_NodeEscrow:    ${nodeEscrowAddr}`);
  console.log(`EXPL_BridgeEscrow:  ${bridgeEscrowAddr}`);
  console.log(`Signer:             ${signerPublicKey}`);
  console.log(`Operator:           ${crossChainOperator}`);
  console.log(`Whitelist network:  ${isWhitelistNetwork}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
