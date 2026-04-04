import { ethers } from 'ethers';
import ETH_ABI from '../abis/ETH_ABI.json';
import NODE_ABI from '../abis/NODE_ABI.json';

const ETHEREUM_CONFIG = {
  chainId: '0x1',  
  contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
  websocket: `wss://eth-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`,  
  abi: ETH_ABI
};
const NODE_CONFIG = {
  contractAddress: process.env.REACT_APP_NODE_CONTRACT_ADDRESS,
  abi: NODE_ABI
};

let provider = null;
let contract = null;
let nodeContract = null;

const getProvider = () => {
  if (!provider) {
    provider = new ethers.providers.WebSocketProvider(ETHEREUM_CONFIG.websocket);
    
    // Setup provider event listeners
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

  // Wait a bit before attempting to reconnect
  setTimeout(() => {
    try {
      getProvider();
    } catch (error) {
      console.error('Failed to reconnect Ethereum provider:', error);
    }
  }, 5000);
};

const getContract = () => {
  if (!contract) {
    const provider = getProvider();
    contract = new ethers.Contract(ETHEREUM_CONFIG.contractAddress, ETHEREUM_CONFIG.abi, provider);
  }
  return contract;
};

const getNodeContract = () => {
  if (!nodeContract) {
    const provider = getProvider();
    nodeContract = new ethers.Contract(NODE_CONFIG.contractAddress, NODE_CONFIG.abi, provider);
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