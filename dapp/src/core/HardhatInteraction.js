/**
 * Local Hardhat provider for dev testing.
 * Creates 3 contract instances (ETH, Flare, BSC) all on the same Hardhat node.
 */
import { ethers } from 'ethers';
import NODE_ABI from '../abis/NODE_ABI.json';

const HARDHAT_RPC = 'http://127.0.0.1:8545';

let provider = null;

const getProvider = () => {
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC);
  }
  return provider;
};

const createNodeContract = (address) => {
  return new ethers.Contract(address, NODE_ABI, getProvider());
};

// These are set by deploy-local.ts and read from .env
const ETH_ADDR = process.env.REACT_APP_LOCAL_ETH_CONTRACT;
const FLARE_ADDR = process.env.REACT_APP_LOCAL_FLARE_CONTRACT;
const BSC_ADDR = process.env.REACT_APP_LOCAL_BSC_CONTRACT;

export const NodeHardhatEth = ETH_ADDR ? createNodeContract(ETH_ADDR) : null;
export const NodeHardhatFlare = FLARE_ADDR ? createNodeContract(FLARE_ADDR) : null;
export const NodeHardhatBsc = BSC_ADDR ? createNodeContract(BSC_ADDR) : null;

export const HardhatProvider = getProvider();

export const isLocalMode = () => {
  return process.env.REACT_APP_LOCAL_MODE === 'true';
};

export const getLocalContractAddress = (simulatedNetwork) => {
  switch (simulatedNetwork) {
    case 'Ethereum': return ETH_ADDR;
    case 'Flare': return FLARE_ADDR;
    case 'Binance Smart Chain': return BSC_ADDR;
    default: return ETH_ADDR;
  }
};

// Emitter to sync simulated chain selection across components
export const simulatedChainEmitter = {
  _current: 'Ethereum',
  _listeners: new Set(),
  emit(chain) {
    this._current = chain;
    this._listeners.forEach(fn => fn(chain));
  },
  getCurrent() {
    return this._current;
  },
  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }
};
