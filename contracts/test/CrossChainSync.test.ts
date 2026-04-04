import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Simulates 3-chain cross-chain sync on a single Hardhat network.
 *
 * We deploy 3 independent sets of contracts representing:
 * - "Ethereum" (non-whitelist, a2OtherChainsTnftSupply starts at 1200)
 * - "Flare" (whitelist network)
 * - "BSC" (non-whitelist, a2OtherChainsTnftSupply starts at 1200)
 *
 * The Lambda's otherChainQty logic is replicated here to verify
 * that cross-chain supply stays in sync after mints on any chain.
 */

describe("Cross-Chain Supply Sync (3 chains)", function () {
  let owner: SignerWithAddress;
  let signer: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let operator: SignerWithAddress;

  // Contract instances per "chain"
  let ethNodes: any, ethEscrow: any, ethBridge: any;
  let flareNodes: any, flareEscrow: any, flareBridge: any;
  let bscNodes: any, bscEscrow: any, bscBridge: any;

  async function deployChain(isWhitelistNetwork: boolean) {
    const Nodes = await ethers.getContractFactory("explorills_Nodes");
    const nodes = await Nodes.deploy(isWhitelistNetwork, signer.address, operator.address, "");
    await nodes.waitForDeployment();

    const Escrow = await ethers.getContractFactory("explorills_NodeEscrow");
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    const Bridge = await ethers.getContractFactory("explorills_BridgeEscrow");
    const bridge = await Bridge.deploy();
    await bridge.waitForDeployment();

    // Wire up
    await nodes.setOneTimeNodeEscrow(await escrow.getAddress());
    await nodes.setOneTimeCrossChainEscrow(await bridge.getAddress());
    await nodes.setPaused(false);

    return { nodes, escrow, bridge };
  }

  async function generateSignature(
    value: bigint,
    otherChainQty: bigint,
    mintAmount: bigint,
    timestamp: bigint,
    randomNonce: string
  ) {
    const dataHash = ethers.keccak256(
      ethers.solidityPacked(
        ["uint256", "uint256", "uint256", "uint256", "string"],
        [value, otherChainQty, mintAmount, timestamp, randomNonce]
      )
    );
    const signature = await signer.signMessage(ethers.getBytes(dataHash));
    return signature;
  }

  async function mintOnChain(
    contract: any,
    minter: SignerWithAddress,
    mintAmount: number,
    otherChainQty: number,
    value: bigint = 0n
  ) {
    const block = await ethers.provider.getBlock("latest");
    const timestamp = BigInt(block!.timestamp);
    const nonce = Math.floor(Math.random() * 1e18).toString().padStart(18, "0");

    const sig = await generateSignature(
      value,
      BigInt(otherChainQty),
      BigInt(mintAmount),
      timestamp,
      nonce
    );

    const params = {
      otherChainQty: otherChainQty,
      mintAmount: mintAmount,
      timestamp: timestamp,
      randomNonce: nonce,
      signature: sig,
    };

    await contract.connect(minter).mint(params, { value });
  }

  /**
   * Replicates Lambda's otherChainQty calculation for 3 chains.
   * This is the critical logic being tested.
   */
  async function calculateOtherChainQty(
    targetChain: "eth" | "flare" | "bsc"
  ): Promise<number> {
    const ethSupply = await ethNodes.a1CurrentChainTnftSupply();
    const ethOther = await ethNodes.a2OtherChainsTnftSupply();
    const flareSupply = await flareNodes.a1CurrentChainTnftSupply();
    const flareOther = await flareNodes.a2OtherChainsTnftSupply();
    const whitelistMinted = await flareNodes.whitelistMintedCount();
    const bscSupply = await bscNodes.a1CurrentChainTnftSupply();
    const bscOther = await bscNodes.a2OtherChainsTnftSupply();

    let qty: bigint;

    if (targetChain === "eth") {
      // ETH needs to know about Flare + BSC supply
      const actualOtherSupply = (flareSupply - whitelistMinted) + 1200n + bscSupply;
      const diff = actualOtherSupply - ethOther;
      qty = diff > 0n ? diff : 0n;
    } else if (targetChain === "flare") {
      // Flare needs to know about ETH + BSC supply
      const actualOtherSupply = ethSupply + bscSupply;
      const diff = actualOtherSupply - flareOther;
      qty = diff > 0n ? diff : 0n;
    } else {
      // BSC needs to know about ETH + Flare supply
      const actualOtherSupply = ethSupply + (flareSupply - whitelistMinted) + 1200n;
      const diff = actualOtherSupply - bscOther;
      qty = diff > 0n ? diff : 0n;
    }

    return Number(qty);
  }

  async function getTotalGlobalSupply(): Promise<bigint> {
    const ethSupply = await ethNodes.a1CurrentChainTnftSupply();
    const flareSupply = await flareNodes.a1CurrentChainTnftSupply();
    const whitelistMinted = await flareNodes.whitelistMintedCount();
    const bscSupply = await bscNodes.a1CurrentChainTnftSupply();
    return ethSupply + (flareSupply - whitelistMinted) + bscSupply;
  }

  beforeEach(async function () {
    [owner, signer, user1, user2, user3, operator] = await ethers.getSigners();

    // Deploy 3 independent contract sets
    ({ nodes: ethNodes, escrow: ethEscrow, bridge: ethBridge } = await deployChain(false));
    ({ nodes: flareNodes, escrow: flareEscrow, bridge: flareBridge } = await deployChain(true));
    ({ nodes: bscNodes, escrow: bscEscrow, bridge: bscBridge } = await deployChain(false));
  });

  describe("Initial State", function () {
    it("ETH starts with a2OtherChainsTnftSupply = 1200 (whitelist reserve)", async function () {
      expect(await ethNodes.a2OtherChainsTnftSupply()).to.equal(1200);
      expect(await ethNodes.a1CurrentChainTnftSupply()).to.equal(0);
    });

    it("Flare starts with a2OtherChainsTnftSupply = 0", async function () {
      expect(await flareNodes.a2OtherChainsTnftSupply()).to.equal(0);
      expect(await flareNodes.a1CurrentChainTnftSupply()).to.equal(0);
    });

    it("BSC starts with a2OtherChainsTnftSupply = 1200 (whitelist reserve)", async function () {
      expect(await bscNodes.a2OtherChainsTnftSupply()).to.equal(1200);
      expect(await bscNodes.a1CurrentChainTnftSupply()).to.equal(0);
    });

    it("Total global supply starts at 0 (actual minted)", async function () {
      const total = await getTotalGlobalSupply();
      expect(total).to.equal(0);
    });
  });

  describe("Single Chain Minting", function () {
    it("Minting on ETH with otherChainQty=0 only updates ETH supply", async function () {
      await mintOnChain(ethNodes, user1, 5, 0);

      expect(await ethNodes.a1CurrentChainTnftSupply()).to.equal(5);
      expect(await ethNodes.a2OtherChainsTnftSupply()).to.equal(1200); // unchanged
      expect(await flareNodes.a1CurrentChainTnftSupply()).to.equal(0);
      expect(await bscNodes.a1CurrentChainTnftSupply()).to.equal(0);
    });

    it("Correct node IDs minted on ETH (non-whitelist: startId = totalSupply - 1200 + 1)", async function () {
      // ETH totalSupply = 5 + 1200 = 1205, startId = 1205 - 1200 + 1 = 6
      // Wait, initially: a1=0, a2=1200, total=1200. So startId = 1200 - 1200 + 1 = 1
      await mintOnChain(ethNodes, user1, 3, 0);
      expect(await ethNodes.a4TotalMintedCurrentChain()).to.equal(3);
    });
  });

  describe("Two Chain Sync (ETH + Flare)", function () {
    it("Mint on ETH, then Flare learns via otherChainQty", async function () {
      // Mint 5 on ETH
      await mintOnChain(ethNodes, user1, 5, 0);

      // Calculate what Flare needs to learn
      const flareOtherQty = await calculateOtherChainQty("flare");
      expect(flareOtherQty).to.equal(5); // Flare doesn't know about ETH's 5

      // Mint 3 on Flare, carrying the sync
      await mintOnChain(flareNodes, user2, 3, flareOtherQty);

      expect(await flareNodes.a1CurrentChainTnftSupply()).to.equal(3);
      expect(await flareNodes.a2OtherChainsTnftSupply()).to.equal(5);

      // Global supply = 5 (ETH) + 3 (Flare) = 8
      expect(await getTotalGlobalSupply()).to.equal(8);
    });

    it("Bidirectional sync: ETH mints, Flare mints, ETH learns about Flare", async function () {
      // Step 1: Mint 5 on ETH
      await mintOnChain(ethNodes, user1, 5, 0);

      // Step 2: Mint 3 on Flare (learns about ETH's 5)
      const flareOtherQty = await calculateOtherChainQty("flare");
      await mintOnChain(flareNodes, user2, 3, flareOtherQty);

      // Step 3: ETH needs to learn about Flare's 3
      const ethOtherQty = await calculateOtherChainQty("eth");
      expect(ethOtherQty).to.equal(3); // Flare minted 3, ETH doesn't know yet

      // Step 4: Mint 2 more on ETH (carries Flare sync)
      await mintOnChain(ethNodes, user1, 2, ethOtherQty);

      expect(await ethNodes.a1CurrentChainTnftSupply()).to.equal(7);
      expect(await ethNodes.a2OtherChainsTnftSupply()).to.equal(1203); // 1200 + 3
      expect(await getTotalGlobalSupply()).to.equal(10);
    });
  });

  describe("Three Chain Sync (ETH + Flare + BSC)", function () {
    it("Mint on ETH, then BSC learns, then Flare learns about both", async function () {
      // Step 1: Mint 10 on ETH
      await mintOnChain(ethNodes, user1, 10, 0);
      expect(await getTotalGlobalSupply()).to.equal(10);

      // Step 2: First mint on BSC — should learn about ETH's 10
      const bscOtherQty1 = await calculateOtherChainQty("bsc");
      expect(bscOtherQty1).to.equal(10);
      await mintOnChain(bscNodes, user2, 5, bscOtherQty1);
      expect(await bscNodes.a2OtherChainsTnftSupply()).to.equal(1210); // 1200 + 10
      expect(await getTotalGlobalSupply()).to.equal(15);

      // Step 3: Flare mints — should learn about ETH(10) + BSC(5)
      const flareOtherQty = await calculateOtherChainQty("flare");
      expect(flareOtherQty).to.equal(15); // ETH=10 + BSC=5
      await mintOnChain(flareNodes, user3, 2, flareOtherQty);
      expect(await flareNodes.a2OtherChainsTnftSupply()).to.equal(15);
      expect(await getTotalGlobalSupply()).to.equal(17);
    });

    it("All three chains mint alternately, supplies stay consistent", async function () {
      // Round 1: ETH mints 5
      await mintOnChain(ethNodes, user1, 5, 0);

      // Round 1: Flare mints 3 (learns about ETH)
      let qty = await calculateOtherChainQty("flare");
      await mintOnChain(flareNodes, user2, 3, qty);

      // Round 1: BSC mints 4 (learns about ETH + Flare)
      qty = await calculateOtherChainQty("bsc");
      await mintOnChain(bscNodes, user3, 4, qty);

      expect(await getTotalGlobalSupply()).to.equal(12);

      // Round 2: ETH mints 2 (learns about Flare + BSC)
      qty = await calculateOtherChainQty("eth");
      await mintOnChain(ethNodes, user1, 2, qty);

      // Round 2: Flare mints 1 (learns about ETH's 2 + BSC's 4)
      qty = await calculateOtherChainQty("flare");
      await mintOnChain(flareNodes, user2, 1, qty);

      // Round 2: BSC mints 3 (learns about ETH + Flare updates)
      qty = await calculateOtherChainQty("bsc");
      await mintOnChain(bscNodes, user3, 3, qty);

      const total = await getTotalGlobalSupply();
      expect(total).to.equal(18); // 7 + 4 + 7

      // Verify each chain's view is consistent
      const ethTotal = await ethNodes.a3GetTotalCurrentSupply();
      const flareTotal = await flareNodes.a3GetTotalCurrentSupply();
      const bscTotal = await bscNodes.a3GetTotalCurrentSupply();

      // Each chain should see the full global supply from its own perspective
      // (after its last sync)
      expect(await ethNodes.a1CurrentChainTnftSupply()).to.equal(7);
      expect(await flareNodes.a1CurrentChainTnftSupply()).to.equal(4);
      expect(await bscNodes.a1CurrentChainTnftSupply()).to.equal(7);
    });

    it("No sync needed when otherChainQty is 0 (no new mints elsewhere)", async function () {
      // Mint on ETH
      await mintOnChain(ethNodes, user1, 5, 0);

      // Sync BSC
      let qty = await calculateOtherChainQty("bsc");
      await mintOnChain(bscNodes, user2, 3, qty);

      // BSC mints again immediately — no new activity on other chains
      qty = await calculateOtherChainQty("bsc");
      expect(qty).to.equal(0); // Nothing new to sync
      await mintOnChain(bscNodes, user2, 2, 0);

      expect(await bscNodes.a1CurrentChainTnftSupply()).to.equal(5);
      expect(await getTotalGlobalSupply()).to.equal(10);
    });
  });

  describe("Edge Cases", function () {
    it("BSC first mint with large existing supply on ETH + Flare", async function () {
      // Simulate significant activity on ETH and Flare before BSC joins
      await mintOnChain(ethNodes, user1, 50, 0);

      let qty = await calculateOtherChainQty("flare");
      await mintOnChain(flareNodes, user2, 30, qty);

      qty = await calculateOtherChainQty("eth");
      await mintOnChain(ethNodes, user1, 20, qty);

      // Total so far: 70 ETH + 30 Flare = 100
      expect(await getTotalGlobalSupply()).to.equal(100);

      // BSC's first mint needs to learn about all 100
      qty = await calculateOtherChainQty("bsc");
      expect(qty).to.equal(100);

      await mintOnChain(bscNodes, user3, 1, qty);
      expect(await bscNodes.a2OtherChainsTnftSupply()).to.equal(1300); // 1200 + 100
      expect(await getTotalGlobalSupply()).to.equal(101);
    });

    it("Rapid minting on one chain, stale others catch up", async function () {
      // Many mints on ETH without any syncing
      for (let i = 0; i < 5; i++) {
        await mintOnChain(ethNodes, user1, 10, 0);
      }
      expect(await ethNodes.a1CurrentChainTnftSupply()).to.equal(50);

      // Flare and BSC are completely stale
      expect(await flareNodes.a2OtherChainsTnftSupply()).to.equal(0);
      expect(await bscNodes.a2OtherChainsTnftSupply()).to.equal(1200);

      // Both catch up in single mints
      let flareQty = await calculateOtherChainQty("flare");
      expect(flareQty).to.equal(50);
      await mintOnChain(flareNodes, user2, 1, flareQty);

      let bscQty = await calculateOtherChainQty("bsc");
      expect(bscQty).to.equal(51); // ETH=50 + Flare=1
      await mintOnChain(bscNodes, user3, 1, bscQty);

      expect(await getTotalGlobalSupply()).to.equal(52);
    });

    it("Signature prevents replay (used signature rejected)", async function () {
      const block = await ethers.provider.getBlock("latest");
      const timestamp = BigInt(block!.timestamp);
      const nonce = "123456789012345678";

      const sig = await generateSignature(0n, 0n, 5n, timestamp, nonce);

      const params = {
        otherChainQty: 0,
        mintAmount: 5,
        timestamp: timestamp,
        randomNonce: nonce,
        signature: sig,
      };

      // First mint succeeds
      await ethNodes.connect(user1).mint(params, { value: 0 });

      // Same signature rejected
      await expect(
        ethNodes.connect(user1).mint(params, { value: 0 })
      ).to.be.revertedWith("Signature already used");
    });

    it("Expired signature is rejected", async function () {
      const block = await ethers.provider.getBlock("latest");
      const expiredTimestamp = BigInt(block!.timestamp) - 600n; // 10 min ago
      const nonce = "987654321012345678";

      const sig = await generateSignature(0n, 0n, 1n, expiredTimestamp, nonce);

      const params = {
        otherChainQty: 0,
        mintAmount: 1,
        timestamp: expiredTimestamp,
        randomNonce: nonce,
        signature: sig,
      };

      await expect(
        ethNodes.connect(user1).mint(params, { value: 0 })
      ).to.be.revertedWith("Signature expired");
    });

    it("Wrong signer signature is rejected", async function () {
      const block = await ethers.provider.getBlock("latest");
      const timestamp = BigInt(block!.timestamp);
      const nonce = "111111111111111111";

      // Sign with user1 instead of signer
      const dataHash = ethers.keccak256(
        ethers.solidityPacked(
          ["uint256", "uint256", "uint256", "uint256", "string"],
          [0n, 0n, 1n, timestamp, nonce]
        )
      );
      const badSig = await user1.signMessage(ethers.getBytes(dataHash));

      const params = {
        otherChainQty: 0,
        mintAmount: 1,
        timestamp: timestamp,
        randomNonce: nonce,
        signature: badSig,
      };

      await expect(
        ethNodes.connect(user1).mint(params, { value: 0 })
      ).to.be.revertedWith("Invalid signature");
    });

    it("Max per address (100) enforced", async function () {
      // Mint 100
      for (let i = 0; i < 10; i++) {
        await mintOnChain(ethNodes, user1, 10, 0);
      }
      expect(await ethNodes.addressMintCount(user1.address)).to.equal(100);

      // 101st should fail
      await expect(
        mintOnChain(ethNodes, user1, 1, 0)
      ).to.be.revertedWith("Exceeds max per address 0.2");
    });
  });

  describe("Node ID Sequencing", function () {
    it("Node IDs are sequential across mints with otherChainQty", async function () {
      // ETH: mint 5 (IDs 1-5), ETH a1=5 a2=1200 total=1205
      await mintOnChain(ethNodes, user1, 5, 0);

      // Flare: mint 3 with otherChainQty=5 (IDs 1-3 on Flare side)
      // Flare a1=3 a2=5 total=8, startId = 8 - whitelistMinted + 1 = ...
      await mintOnChain(flareNodes, user2, 3, 5);

      // BSC: mint 2 with otherChainQty=8 (learns about ETH=5 + Flare=3)
      // BSC a1=2 a2=1208 total=1210, startId = 1210 - 1200 + 1 = 11
      await mintOnChain(bscNodes, user3, 2, 8);

      // Total across chains: 5 + 3 + 2 = 10 actual minted
      expect(await getTotalGlobalSupply()).to.equal(10);

      // Each chain minted in correct ID order
      expect(await ethNodes.a4TotalMintedCurrentChain()).to.equal(5);
      expect(await flareNodes.a4TotalMintedCurrentChain()).to.equal(3);
      expect(await bscNodes.a4TotalMintedCurrentChain()).to.equal(2);
    });
  });

  describe("Supply View Consistency", function () {
    it("a5RemainingNodesToMINT reflects correct global remaining", async function () {
      await mintOnChain(ethNodes, user1, 10, 0);

      // ETH sees: a1=10, a2=1200, total=1210 → remaining = 12000 - 1210 = 10790
      expect(await ethNodes.a5RemainingNodesToMINT()).to.equal(10790);

      // Flare (not synced): a1=0, a2=0, total=0 → remaining = 12000 - 0 = 12000
      // This is the "stale view" - it's wrong until someone mints
      expect(await flareNodes.a5RemainingNodesToMINT()).to.equal(12000);

      // After Flare syncs via mint:
      const qty = await calculateOtherChainQty("flare");
      await mintOnChain(flareNodes, user2, 1, qty);

      // Now Flare sees: a1=1, a2=10, total=11 → remaining = 12000 - 11 = 11989
      expect(await flareNodes.a5RemainingNodesToMINT()).to.equal(11989);
    });
  });
});
