import { ethers } from 'ethers';

const FLARE_PRICE_CONFIG = {
  httpRpc: "https://flare-api.flare.network/ext/C/rpc",
  contractAddress: "0xB18d3A5e5A85C65cE47f977D7F486B79F99D3d32", // FtsoV2 contract address
  abi: ["function getFeedsByIndex(uint256[] _indices) external view returns (uint256[] _values, int8[] _decimals, uint64 _timestamp)"]
};

let provider = null;
let contract = null;

const getProvider = () => {
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider(FLARE_PRICE_CONFIG.httpRpc);
  }
  return provider;
};

const getContract = () => {
  if (!contract) {
    const provider = getProvider();
    contract = new ethers.Contract(FLARE_PRICE_CONFIG.contractAddress, FLARE_PRICE_CONFIG.abi, provider);
  }
  return contract;
};

export const FlarePriceInteraction = {
  fetchCurrentFeeds: async (indices) => {
    const contract = getContract();
    try {
      const [feeds, decimals, timestamp] = await contract.getFeedsByIndex(indices);
      return [feeds, decimals, timestamp];
    } catch (error) {
      console.error("Error fetching feeds:", error);
      throw error;
    }
  }
};