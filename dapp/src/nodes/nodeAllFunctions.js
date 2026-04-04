import { useCallback } from 'react';
import { NodeEthereumInteraction, NodeFlareInteraction } from '../core/contractInteractions';
import { isLocalMode, NodeHardhatEth, NodeHardhatFlare, NodeHardhatBsc } from '../core/HardhatInteraction';

export const useNodeFunctions = () => {
  const callNodeEthereumFunction = useCallback(async (functionName, ...args) => {
    try {
      const contract = isLocalMode() ? NodeHardhatEth : NodeEthereumInteraction;
      const result = await contract[functionName](...args);
      return result;
    } catch (err) {
      console.error(`Error calling Node Ethereum ${functionName}:`, err);
      return null;
    }
  }, []);

  const callNodeFlareFunction = useCallback(async (functionName, ...args) => {
    try {
      const contract = isLocalMode() ? NodeHardhatFlare : NodeFlareInteraction;
      const result = await contract[functionName](...args);
      return result;
    } catch (err) {
      console.error(`Error calling Node Flare ${functionName}:`, err);
      return null;
    }
  }, []);

  // VIEW FUNCTIONS

  const getNativeBalance = useCallback(async (network, address) => {
    try {
      if (network === 'ethereum') {
        return NodeEthereumInteraction.provider.getBalance(address);
      } else {
        return NodeFlareInteraction.provider.getBalance(address);
      }
    } catch (err) {
      console.error(`Error getting native balance:`, err);
      return null;
    }
  }, []);

  const getPaused = useCallback(async (network) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('paused');
    } else {
      return callNodeFlareFunction('paused');
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);
  
  const getWhitelistPaused = useCallback(async (network) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('whitelistPaused');
    } else {
      return callNodeFlareFunction('whitelistPaused');
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);

  const getWhitelistStatus = useCallback(async (network, address) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('getWhitelistStatus', address);
    } else {
      return callNodeFlareFunction('getWhitelistStatus', address);
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);

  const getA1CurrentChainTnftSupply = useCallback(async (network) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('a1CurrentChainTnftSupply');
    } else {
      return callNodeFlareFunction('a1CurrentChainTnftSupply');
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);

  const getA2OtherChainsTnftSupply = useCallback(async (network) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('a2OtherChainsTnftSupply');
    } else {
      return callNodeFlareFunction('a2OtherChainsTnftSupply');
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);

  const getA3GetTotalCurrentSupply = useCallback(async (network) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('a3GetTotalCurrentSupply');
    } else {
      return callNodeFlareFunction('a3GetTotalCurrentSupply');
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);

  const getWhitelistMintedCount = useCallback(async (network) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('whitelistMintedCount');
    } else {
      return callNodeFlareFunction('whitelistMintedCount');
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);

  const getA5RemainingNodesToMINT = useCallback(async (network) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('a5RemainingNodesToMINT');
    } else {
      return callNodeFlareFunction('a5RemainingNodesToMINT');
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);

  const getBatchPriceInUSD = useCallback(async (network, startId, endId) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('getBatchPriceInUSD', startId, endId);
    } else {
      return callNodeFlareFunction('getBatchPriceInUSD', startId, endId);
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);

  const getCurrentPriceInUSD = useCallback(async (network, nodeId) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('getCurrentPriceInUSD', nodeId);
    } else {
      return callNodeFlareFunction('getCurrentPriceInUSD', nodeId);
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);
  
 // USER VIEW FUNTIONS
  const getA6AddressEscrowHoldings = useCallback(async (network, address) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('a6AddressEscrowHoldings', address);
    } else {
      return callNodeFlareFunction('a6AddressEscrowHoldings', address);
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);

  // WRITE FUNCTIONS
  const setA2SetUpBackUpAddresses = useCallback(async (network, backup1Address, backup2Address) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('a2SetUpBackUpAddresses', backup1Address, backup2Address);
    } else {
      return callNodeFlareFunction('a2SetUpBackUpAddresses', backup1Address, backup2Address);
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);

  const setA3PullMyNodesFromEscrow = useCallback(async (network) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('a3PullMyNodesFromEscrow');
    } else {
      return callNodeFlareFunction('a3PullMyNodesFromEscrow');
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);

  const setA4ReceiveTnftFromUserToOtherChainsSupply = useCallback(async (network, tokenIds) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('a4ReceiveTnftFromUserToOtherChainsSupply', tokenIds);
    } else {
      return callNodeFlareFunction('a4ReceiveTnftFromUserToOtherChainsSupply', tokenIds);
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);

  const setA5SendTnftToUserFromOtherChainsSupply = useCallback(async (network, to, tokenIds) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('a5SendTnftToUserFromOtherChainsSupply', to, tokenIds);
    } else {
      return callNodeFlareFunction('a5SendTnftToUserFromOtherChainsSupply', to, tokenIds);
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);

  const setMint = useCallback(async (network, mintParams) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('mint', mintParams);
    } else {
      return callNodeFlareFunction('mint', mintParams);
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);

  const setWhitelistMint = useCallback(async (network) => {
    if (network === 'ethereum') {
      return callNodeEthereumFunction('whitelistMint');
    } else {
      return callNodeFlareFunction('whitelistMint');
    }
  }, [callNodeEthereumFunction, callNodeFlareFunction]);

  return {
    // View Functions
    getA1CurrentChainTnftSupply,
    getA2OtherChainsTnftSupply,
    getA3GetTotalCurrentSupply,
    getWhitelistMintedCount,
    getA5RemainingNodesToMINT,
    getA6AddressEscrowHoldings,
    getNativeBalance,
    getWhitelistStatus,
    getPaused,
    getWhitelistPaused,
    getBatchPriceInUSD,
    getCurrentPriceInUSD,

    // Write Functions
    setA2SetUpBackUpAddresses,
    setA3PullMyNodesFromEscrow,
    setA4ReceiveTnftFromUserToOtherChainsSupply,
    setA5SendTnftToUserFromOtherChainsSupply,
    setMint,
    setWhitelistMint
  };
};