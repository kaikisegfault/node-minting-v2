import { ethers } from 'ethers';
import ETH_ABI from '../abis/ETH_ABI.json';
import NODE_ABI from '../abis/NODE_ABI.json';
import { CONFIG } from '../config/environment';

const ETHEREUM_CONFIG = {
  chainId: CONFIG.providers.ethereum.chainId,
  contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
  websocket: CONFIG.providers.ethereum.websocket,
  abi: ETH_ABI
};
const NODE_CONFIG = {
  contractAddress: CONFIG.contracts.node,
  abi: NODE_ABI
};

let provider = null;
let contract = null;
let nodeContract = null;

const getProvider = () => {
  if (!provider) {
    provider = new ethers.providers.WebSocketProvider(ETHEREUM_CONFIG.websocket);

    provider._websocket.onerror = (error) => {
      console.error('Ethereum WebSocket Error:', error);
      handleProviderError();
    };

    provider._websocket.onclose = () => {
      console.log('Ethereum WebSocket Closed');
      handleProviderError();
    };
  }
  return provider;
};

const handleProviderError = () => {
  provider = null;
  contract = null;
  nodeContract = null;

  setTimeout(() => {
    try {
      getProvider();
    } catch (error) {
      console.error('Failed to reconnect Ethereum provider:', error);
    }
  }, 5000);
};

const getContract = () => {
  if (!contract && ETHEREUM_CONFIG.contractAddress) {
    const p = getProvider();
    contract = new ethers.Contract(ETHEREUM_CONFIG.contractAddress, ETHEREUM_CONFIG.abi, p);
  }
  return contract;
};

const getNodeContract = () => {
  if (!nodeContract && NODE_CONFIG.contractAddress) {
    const p = getProvider();
    nodeContract = new ethers.Contract(NODE_CONFIG.contractAddress, NODE_CONFIG.abi, p);
  }
  return nodeContract;
};

export const EthereumInteraction = getContract();
export const NodeEthereumInteraction = getNodeContract();

export const destroyEthereumConnection = () => {
  if (provider) {
    if (provider._websocket && provider._websocket.readyState === WebSocket.OPEN) {
      provider._websocket.close();
    }
    provider = null;
    contract = null;
    nodeContract = null;
  }
};
