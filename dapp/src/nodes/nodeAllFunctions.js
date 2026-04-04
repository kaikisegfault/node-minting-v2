import { useCallback } from 'react';
import { NodeEthereumInteraction, NodeFlareInteraction, NodeBSCInteraction } from '../core/contractInteractions';
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

  const callNodeBSCFunction = useCallback(async (functionName, ...args) => {
    try {
      // eslint-disable-next-line
      const contract = isLocalMode() ? NodeHardhatBsc : NodeBSCInteraction;
      const result = await contract[functionName](...args);
      return result;
    } catch (err) {
      console.error(`Error calling Node BSC ${functionName}:`, err);
      return null;
    }
  }, []);

  const callByNetwork = useCallback((network, fn, ethFn, flareFn, bscFn) => {
    if (network === 'ethereum' || network === 'Ethereum') return ethFn();
    if (network === 'bsc' || network === 'Binance Smart Chain') return bscFn();
    return flareFn(); // Flare is default
  }, []);

  // VIEW FUNCTIONS

  const getNativeBalance = useCallback(async (network, address) => {
    try {
      if (network === 'ethereum') {
        return NodeEthereumInteraction.provider.getBalance(address);
      } else if (network === 'bsc') {
        return NodeBSCInteraction.provider.getBalance(address);
      } else {
        return NodeFlareInteraction.provider.getBalance(address);
      }
    } catch (err) {
      console.error(`Error getting native balance:`, err);
      return null;
    }
  }, []);

  const getPaused = useCallback(async (network) => {
    return callByNetwork(network, 'paused',
      () => callNodeEthereumFunction('paused'),
      () => callNodeFlareFunction('paused'),
      () => callNodeBSCFunction('paused')
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

  const getWhitelistPaused = useCallback(async (network) => {
    return callByNetwork(network, 'whitelistPaused',
      () => callNodeEthereumFunction('whitelistPaused'),
      () => callNodeFlareFunction('whitelistPaused'),
      () => callNodeBSCFunction('whitelistPaused')
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

  const getWhitelistStatus = useCallback(async (network, address) => {
    return callByNetwork(network, 'getWhitelistStatus',
      () => callNodeEthereumFunction('getWhitelistStatus', address),
      () => callNodeFlareFunction('getWhitelistStatus', address),
      () => callNodeBSCFunction('getWhitelistStatus', address)
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

  const getA1CurrentChainTnftSupply = useCallback(async (network) => {
    return callByNetwork(network, 'a1CurrentChainTnftSupply',
      () => callNodeEthereumFunction('a1CurrentChainTnftSupply'),
      () => callNodeFlareFunction('a1CurrentChainTnftSupply'),
      () => callNodeBSCFunction('a1CurrentChainTnftSupply')
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

  const getA2OtherChainsTnftSupply = useCallback(async (network) => {
    return callByNetwork(network, 'a2OtherChainsTnftSupply',
      () => callNodeEthereumFunction('a2OtherChainsTnftSupply'),
      () => callNodeFlareFunction('a2OtherChainsTnftSupply'),
      () => callNodeBSCFunction('a2OtherChainsTnftSupply')
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

  const getA3GetTotalCurrentSupply = useCallback(async (network) => {
    return callByNetwork(network, 'a3GetTotalCurrentSupply',
      () => callNodeEthereumFunction('a3GetTotalCurrentSupply'),
      () => callNodeFlareFunction('a3GetTotalCurrentSupply'),
      () => callNodeBSCFunction('a3GetTotalCurrentSupply')
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

  const getWhitelistMintedCount = useCallback(async (network) => {
    return callByNetwork(network, 'whitelistMintedCount',
      () => callNodeEthereumFunction('whitelistMintedCount'),
      () => callNodeFlareFunction('whitelistMintedCount'),
      () => callNodeBSCFunction('whitelistMintedCount')
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

  const getA5RemainingNodesToMINT = useCallback(async (network) => {
    return callByNetwork(network, 'a5RemainingNodesToMINT',
      () => callNodeEthereumFunction('a5RemainingNodesToMINT'),
      () => callNodeFlareFunction('a5RemainingNodesToMINT'),
      () => callNodeBSCFunction('a5RemainingNodesToMINT')
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

  const getBatchPriceInUSD = useCallback(async (network, startId, endId) => {
    return callByNetwork(network, 'getBatchPriceInUSD',
      () => callNodeEthereumFunction('getBatchPriceInUSD', startId, endId),
      () => callNodeFlareFunction('getBatchPriceInUSD', startId, endId),
      () => callNodeBSCFunction('getBatchPriceInUSD', startId, endId)
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

  const getCurrentPriceInUSD = useCallback(async (network, nodeId) => {
    return callByNetwork(network, 'getCurrentPriceInUSD',
      () => callNodeEthereumFunction('getCurrentPriceInUSD', nodeId),
      () => callNodeFlareFunction('getCurrentPriceInUSD', nodeId),
      () => callNodeBSCFunction('getCurrentPriceInUSD', nodeId)
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

 // USER VIEW FUNTIONS
  const getA6AddressEscrowHoldings = useCallback(async (network, address) => {
    return callByNetwork(network, 'a6AddressEscrowHoldings',
      () => callNodeEthereumFunction('a6AddressEscrowHoldings', address),
      () => callNodeFlareFunction('a6AddressEscrowHoldings', address),
      () => callNodeBSCFunction('a6AddressEscrowHoldings', address)
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

  // WRITE FUNCTIONS
  const setA2SetUpBackUpAddresses = useCallback(async (network, backup1Address, backup2Address) => {
    return callByNetwork(network, 'a2SetUpBackUpAddresses',
      () => callNodeEthereumFunction('a2SetUpBackUpAddresses', backup1Address, backup2Address),
      () => callNodeFlareFunction('a2SetUpBackUpAddresses', backup1Address, backup2Address),
      () => callNodeBSCFunction('a2SetUpBackUpAddresses', backup1Address, backup2Address)
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

  const setA3PullMyNodesFromEscrow = useCallback(async (network) => {
    return callByNetwork(network, 'a3PullMyNodesFromEscrow',
      () => callNodeEthereumFunction('a3PullMyNodesFromEscrow'),
      () => callNodeFlareFunction('a3PullMyNodesFromEscrow'),
      () => callNodeBSCFunction('a3PullMyNodesFromEscrow')
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

  const setA4ReceiveTnftFromUserToOtherChainsSupply = useCallback(async (network, tokenIds) => {
    return callByNetwork(network, 'a4ReceiveTnftFromUserToOtherChainsSupply',
      () => callNodeEthereumFunction('a4ReceiveTnftFromUserToOtherChainsSupply', tokenIds),
      () => callNodeFlareFunction('a4ReceiveTnftFromUserToOtherChainsSupply', tokenIds),
      () => callNodeBSCFunction('a4ReceiveTnftFromUserToOtherChainsSupply', tokenIds)
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

  const setA5SendTnftToUserFromOtherChainsSupply = useCallback(async (network, to, tokenIds) => {
    return callByNetwork(network, 'a5SendTnftToUserFromOtherChainsSupply',
      () => callNodeEthereumFunction('a5SendTnftToUserFromOtherChainsSupply', to, tokenIds),
      () => callNodeFlareFunction('a5SendTnftToUserFromOtherChainsSupply', to, tokenIds),
      () => callNodeBSCFunction('a5SendTnftToUserFromOtherChainsSupply', to, tokenIds)
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

  const setMint = useCallback(async (network, mintParams) => {
    return callByNetwork(network, 'mint',
      () => callNodeEthereumFunction('mint', mintParams),
      () => callNodeFlareFunction('mint', mintParams),
      () => callNodeBSCFunction('mint', mintParams)
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

  const setWhitelistMint = useCallback(async (network) => {
    return callByNetwork(network, 'whitelistMint',
      () => callNodeEthereumFunction('whitelistMint'),
      () => callNodeFlareFunction('whitelistMint'),
      () => callNodeBSCFunction('whitelistMint')
    );
  }, [callByNetwork, callNodeEthereumFunction, callNodeFlareFunction, callNodeBSCFunction]);

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
