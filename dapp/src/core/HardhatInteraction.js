/**
 * Local Hardhat provider for dev testing.
 * LAZY initialization — only creates connections when isLocalMode() is true.
 */
import { ethers } from 'ethers';
import NODE_ABI from '../abis/NODE_ABI.json';

const LOCAL_MODE = process.env.REACT_APP_LOCAL_MODE === 'true';

let provider = null;

const getProvider = () => {
  if (!LOCAL_MODE) return null;
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
  }
  return provider;
};

const createNodeContract = (address) => {
  if (!LOCAL_MODE || !address) return null;
  return new ethers.Contract(address, NODE_ABI, getProvider());
};

const ETH_ADDR = process.env.REACT_APP_LOCAL_ETH_CONTRACT;
const FLARE_ADDR = process.env.REACT_APP_LOCAL_FLARE_CONTRACT;
const BSC_ADDR = process.env.REACT_APP_LOCAL_BSC_CONTRACT;

export const NodeHardhatEth = createNodeContract(ETH_ADDR);
export const NodeHardhatFlare = createNodeContract(FLARE_ADDR);
export const NodeHardhatBsc = createNodeContract(BSC_ADDR);

export const isLocalMode = () => LOCAL_MODE;

export const getLocalContractAddress = (simulatedNetwork) => {
  switch (simulatedNetwork) {
    case 'Ethereum': return ETH_ADDR;
    case 'Flare': return FLARE_ADDR;
    case 'Binance': return BSC_ADDR;
    default: return ETH_ADDR;
  }
};
