import { ethers } from 'ethers';
import NODE_ABI from '../abis/NODE_ABI.json';
import { CONFIG } from '../config/environment';

const BSC_CONFIG = {
  chainId: CONFIG.providers.bsc.chainId,
  rpc: CONFIG.providers.bsc.rpc || CONFIG.providers.bsc.websocket,
  abi: NODE_ABI
};

const NODE_CONFIG = {
  contractAddress: CONFIG.contracts.nodeBsc || CONFIG.contracts.node,
  abi: NODE_ABI
};

let provider = null;
let nodeContract = null;

const getProvider = () => {
  if (!provider) {
    // BSC public WebSocket can be unreliable, prefer JSON-RPC
    if (BSC_CONFIG.rpc) {
      provider = new ethers.providers.JsonRpcProvider(BSC_CONFIG.rpc);
    } else {
      provider = new ethers.providers.WebSocketProvider(CONFIG.providers.bsc.websocket);

      provider._websocket.onerror = (error) => {
        console.error('BSC WebSocket Error:', error);
        handleProviderError();
      };

      provider._websocket.onclose = () => {
        console.log('BSC WebSocket Closed');
        handleProviderError();
      };
    }
  }
  return provider;
};

const handleProviderError = () => {
  provider = null;
  nodeContract = null;

  setTimeout(() => {
    try {
      getProvider();
    } catch (error) {
      console.error('Failed to reconnect BSC provider:', error);
    }
  }, 5000);
};

const getNodeContract = () => {
  if (!nodeContract && NODE_CONFIG.contractAddress) {
    const p = getProvider();
    nodeContract = new ethers.Contract(NODE_CONFIG.contractAddress, NODE_CONFIG.abi, p);
  }
  return nodeContract;
};

export const NodeBSCInteraction = NODE_CONFIG.contractAddress ? getNodeContract() : null;

export const destroyBSCConnection = () => {
  if (provider && provider._websocket && provider._websocket.readyState === WebSocket.OPEN) {
    provider._websocket.close();
  }
  provider = null;
  nodeContract = null;
};
