import { useEffect, useCallback, useRef } from 'react';
import { useNodeFunctions } from './nodeAllFunctions';
import { setNodeReadOnlyState } from './useNodeReadOnlyState';
import { useNodeEventListeners } from './useNodeEventListeners';

const NodeReadOnlyFetcher = () => {
  const {
    getA1CurrentChainTnftSupply,
    getWhitelistMintedCount
  } = useNodeFunctions();
  const { nodeEventCounter } = useNodeEventListeners();
  const timerRef = useRef(null);

  const convertBlockchainNumber = (value) => {
    if (!value) return 0;
    if (value._isBigNumber) return parseInt(value.toString(), 10);
    if (typeof value === 'string' && value.startsWith('0x')) return parseInt(value, 16);
    return parseInt(value, 10);
  };

  const updateTotalSupplyValues = useCallback((ethSupply, flareSupply, whitelistMinted, bscSupply = 0) => {
    const combinedSupply = ethSupply + flareSupply + bscSupply;
    const totalCurrentNodesValue = combinedSupply - whitelistMinted;

    setNodeReadOnlyState({
      totalSupply: combinedSupply,
      totalCurrentNodes: totalCurrentNodesValue
    });

    console.log('Supply - ETH:', ethSupply, 'Flare:', flareSupply, 'BSC:', bscSupply, 'Total:', totalCurrentNodesValue);
  }, []);

  // Single unified fetch for all chains — prevents BSC from resetting
  const fetchAllSupplies = useCallback(async () => {
    try {
      const [ethSupply, flareSupply, flareWhitelistMinted, bscSupply] = await Promise.all([
        getA1CurrentChainTnftSupply('ethereum'),
        getA1CurrentChainTnftSupply('flare'),
        getWhitelistMintedCount('flare'),
        getA1CurrentChainTnftSupply('bsc')
      ]);

      const convertedEthSupply = convertBlockchainNumber(ethSupply);
      const convertedFlareSupply = convertBlockchainNumber(flareSupply);
      const convertedWhitelistMinted = convertBlockchainNumber(flareWhitelistMinted);
      const convertedBscSupply = convertBlockchainNumber(bscSupply);

      setNodeReadOnlyState({
        ethSupply: convertedEthSupply,
        flareSupply: convertedFlareSupply,
        flareWhitelistMinted: convertedWhitelistMinted
      });

      updateTotalSupplyValues(convertedEthSupply, convertedFlareSupply, convertedWhitelistMinted, convertedBscSupply);
    } catch (error) {
      console.error('Error fetching supply data:', error);
    }
  }, [getA1CurrentChainTnftSupply, getWhitelistMintedCount, updateTotalSupplyValues]);

  // Single polling cycle that always fetches all chains together
  const startDataCycle = useCallback(() => {
    const runFetch = async () => {
      await fetchAllSupplies();
      timerRef.current = setTimeout(runFetch, 12000);
    };
    runFetch();
  }, [fetchAllSupplies]);

  useEffect(() => {
    startDataCycle();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startDataCycle]);

  useEffect(() => {
    fetchAllSupplies();
  }, [nodeEventCounter, fetchAllSupplies]);

  return null;
};

export default NodeReadOnlyFetcher;
