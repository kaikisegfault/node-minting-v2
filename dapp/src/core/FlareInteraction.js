import { ethers } from 'ethers';
import FLARE_ABI from '../abis/FLARE_ABI.json';
import MINERALS_ABI from '../abis/MINERALS_ABI.json';
import NODE_ABI from '../abis/NODE_ABI.json';
import { CONFIG } from '../config/environment';

const FLARE_CONFIG = {
  chainId: CONFIG.providers.flare.chainId,
  contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
  websocket: CONFIG.providers.flare.websocket,
  abi: FLARE_ABI
};

const MINERALS_CONFIG = {
  contractAddress: process.env.REACT_APP_MINERALS_VALIDATOR_CONTRACT,
  abi: MINERALS_ABI
};

const NODE_CONFIG = {
  contractAddress: CONFIG.contracts.node,
  abi: NODE_ABI
};

let provider = null;
let contract = null;
let mineralsContract = null;
let nodeContract = null;

const getProvider = () => {
  if (!provider) {
    provider = new ethers.providers.WebSocketProvider(FLARE_CONFIG.websocket);

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

  setTimeout(() => {
    try {
      getProvider();
    } catch (error) {
      console.error('Failed to reconnect Flare provider:', error);
    }
  }, 5000);
};

const getContract = () => {
  if (!contract && FLARE_CONFIG.contractAddress) {
    const p = getProvider();
    contract = new ethers.Contract(FLARE_CONFIG.contractAddress, FLARE_CONFIG.abi, p);
  }
  return contract;
};

const getMineralsContract = () => {
  if (!mineralsContract && MINERALS_CONFIG.contractAddress) {
    const p = getProvider();
    mineralsContract = new ethers.Contract(MINERALS_CONFIG.contractAddress, MINERALS_CONFIG.abi, p);
  }
  return mineralsContract;
};

const getNodeContract = () => {
  if (!nodeContract && NODE_CONFIG.contractAddress) {
    const p = getProvider();
    nodeContract = new ethers.Contract(NODE_CONFIG.contractAddress, NODE_CONFIG.abi, p);
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
