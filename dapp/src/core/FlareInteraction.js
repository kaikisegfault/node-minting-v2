import { ethers } from 'ethers';
import FLARE_ABI from '../abis/FLARE_ABI.json';
import MINERALS_ABI from '../abis/MINERALS_ABI.json';
import NODE_ABI from '../abis/NODE_ABI.json';

const FLARE_CONFIG = {
  chainId: '0xe',
  contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
  websocket: process.env.REACT_APP_FLARE_WEBSOCKET,
  abi: FLARE_ABI
};

const MINERALS_CONFIG = {
  contractAddress: process.env.REACT_APP_MINERALS_VALIDATOR_CONTRACT,
  abi: MINERALS_ABI
};

const NODE_CONFIG = {
  contractAddress: process.env.REACT_APP_NODE_CONTRACT_ADDRESS,
  abi: NODE_ABI
};

let provider = null;
let contract = null;
let mineralsContract = null;
let nodeContract = null;

const getProvider = () => {
  if (!provider) {
    provider = new ethers.providers.WebSocketProvider(FLARE_CONFIG.websocket);
    
    // Setup provider event listeners
    provider._websocket.onerror = (error) => {
      console.error('Flare WebSocket Error:', error);
      handleProviderError();
    };

    provider._websocket.onclose = () => {
      console.log('Flare WebSocket Closed');
      handleProviderError();
    };
  }
  return provider;
};

const handleProviderError = () => {
  provider = null;
  contract = null;
  mineralsContract = null;
  nodeContract = null;

  // Wait a bit before attempting to reconnect
  setTimeout(() => {
    try {
      getProvider();
    } catch (error) {
      console.error('Failed to reconnect Flare provider:', error);
    }
  }, 5000);
};

const getContract = () => {
  if (!contract) {
    const provider = getProvider();
    contract = new ethers.Contract(FLARE_CONFIG.contractAddress, FLARE_CONFIG.abi, provider);
  }
  return contract;
};

const getMineralsContract = () => {
  if (!mineralsContract) {
    const provider = getProvider();
    mineralsContract = new ethers.Contract(MINERALS_CONFIG.contractAddress, MINERALS_CONFIG.abi, provider);
  }
  return mineralsContract;
};

const getNodeContract = () => {
  if (!nodeContract) {
    const provider = getProvider();
    nodeContract = new ethers.Contract(NODE_CONFIG.contractAddress, NODE_CONFIG.abi, provider);
  }
  return nodeContract;
};

export const FlareInteraction = getContract();
export const MineralsInteraction = getMineralsContract();
export const NodeFlareInteraction = getNodeContract();

export const destroyFlareConnection = () => {
  if (provider) {
    if (provider._websocket && provider._websocket.readyState === WebSocket.OPEN) {
      provider._websocket.close();
    }
    provider = null;
    contract = null;
    mineralsContract = null;
    nodeContract = null;
  }
};