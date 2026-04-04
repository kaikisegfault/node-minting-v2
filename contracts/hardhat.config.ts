import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x" + "0".repeat(64);

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "london",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

  networks: {
    // Local dev networks (Hardhat spins up 3 for multi-chain testing)
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    localChain2: {
      url: "http://127.0.0.1:8546",
      chainId: 31338
    },
    localChain3: {
      url: "http://127.0.0.1:8547",
      chainId: 31339
    },

    // Testnets
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 11155111
    },
    flareTestnet: {
      url: "https://coston2-api.flare.network/ext/bc/C/rpc",
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 114
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 97
    },

    // Production
    ethereum: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 1
    },
    flare: {
      url: "https://flare-api.flare.network/ext/bc/C/rpc",
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 14
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 56
    }
  },

  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "flare",
        chainId: 14,
        urls: {
          apiURL: "https://flare-explorer.flare.network/api",
          browserURL: "https://flare-explorer.flare.network"
        }
      },
      {
        network: "flareTestnet",
        chainId: 114,
        urls: {
          apiURL: "https://coston2-explorer.flare.network/api",
          browserURL: "https://coston2-explorer.flare.network"
        }
      }
    ]
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config;
