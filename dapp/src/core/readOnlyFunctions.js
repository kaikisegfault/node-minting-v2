import { useCallback } from 'react';
import { EthereumInteraction, FlareInteraction, MineralsInteraction } from './contractInteractions';

export const useReadOnlyFunctions = () => {
  const callEthereumFunction = useCallback(async (functionName, ...args) => {
    try {
      const result = await EthereumInteraction[functionName](...args);
      return result;
    } catch (err) {
      console.error(`Error calling Ethereum ${functionName}:`, err);
      return null;
    }
  }, []);

  const callFlareFunction = useCallback(async (functionName, ...args) => {
    try {
      const result = await FlareInteraction[functionName](...args);
      return result;
    } catch (err) {
      console.error(`Error calling Flare ${functionName}:`, err);
      return null;
    }
  }, []);

  const callMineralsFunction = useCallback(async (functionName, ...args) => {
    try {
      const result = await MineralsInteraction[functionName](...args);
      return result;
    } catch (err) {
      console.error(`Error calling Minerals ${functionName}:`, err);
      return null;
    }
  }, []);

  const getAbCurrentChainTnftSupply = useCallback(async (network) => {
    if (network === 'ethereum') {
      return callEthereumFunction('abCurrentChainTnftSupply');
    } else {
      return callFlareFunction('abCurrentChainTnftSupply');
    }
  }, [callEthereumFunction, callFlareFunction]);

  const getAbCurrentChainTerc20SupplyAsTnft = useCallback(async (network) => {
    if (network === 'ethereum') {
      return callEthereumFunction('abCurrentChainTerc20SupplyAsTnft');
    } else {
      return callFlareFunction('abCurrentChainTerc20SupplyAsTnft');
    }
  }, [callEthereumFunction, callFlareFunction]);

  const getBalanceOfBatch = useCallback(async (network, address) => {
    const nftIds = [1, 2, 3, 4];
    const addresses = nftIds.map(() => address);
    if (network === 'ethereum') {
      return callEthereumFunction('balanceOfBatch', addresses, nftIds);
    } else {
      return callFlareFunction('balanceOfBatch', addresses, nftIds);
    }
  }, [callEthereumFunction, callFlareFunction]);

  const getCurrentChainAddressTotalTerc20AsTnft = useCallback(async (network, address) => {
    if (network === 'ethereum') {
      return callEthereumFunction('currentChainAddressTotalTerc20AsTnft', address);
    } else {
      return callFlareFunction('currentChainAddressTotalTerc20AsTnft', address);
    }
  }, [callEthereumFunction, callFlareFunction]);

  const getNativeBalance = useCallback(async (network, address) => {
    if (network === 'ethereum') {
      return callEthereumFunction('getNativeBalance', address);
    } else {
      return callFlareFunction('getNativeBalance', address);
    }
  }, [callEthereumFunction, callFlareFunction]);

  const getPauseState = useCallback(async (network) => {
    if (network === 'ethereum') {
      return callEthereumFunction('paused');
    } else {
      return callFlareFunction('paused');
    }
  }, [callEthereumFunction, callFlareFunction]);

  const getAbOtherChainsTnftSupply = useCallback(async (network) => {
    if (network === 'ethereum') {
      return callEthereumFunction('abOtherChainsTnftSupply');
    } else {
      return callFlareFunction('abOtherChainsTnftSupply');
    }
  }, [callEthereumFunction, callFlareFunction]);

    // New Minerals-specific functions
  const getMineralsAddressInfo = useCallback(async (address) => {
    return callMineralsFunction('getAddressInfo', address);
  }, [callMineralsFunction]);

  const getMineralsGeneralInfo = useCallback(async () => {
    return callMineralsFunction('getGeneralInfo');
  }, [callMineralsFunction]);

  const getMineralsTotalValidated = useCallback(async () => {
    return callMineralsFunction('totalValidatedNFTs');
  }, [callMineralsFunction]);

  const getMineralsPauseState = useCallback(async () => {
    return callMineralsFunction('paused');
  }, [callMineralsFunction]);

  return {
    getAbCurrentChainTnftSupply,
    getAbCurrentChainTerc20SupplyAsTnft,
    getBalanceOfBatch,
    getCurrentChainAddressTotalTerc20AsTnft,
    getNativeBalance,
    getPauseState,
    getAbOtherChainsTnftSupply,
    // New Minerals functions
    getMineralsAddressInfo,
    getMineralsGeneralInfo,
    getMineralsTotalValidated,
    getMineralsPauseState
  };
};