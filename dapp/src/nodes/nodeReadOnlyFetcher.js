import { useEffect, useCallback, useRef } from 'react';
import { useNodeFunctions } from './nodeAllFunctions';
import { setNodeReadOnlyState } from './useNodeReadOnlyState';
import { useNodeEventListeners } from './useNodeEventListeners';
import { isLocalMode, NodeHardhatBsc } from '../core/HardhatInteraction';

const NodeReadOnlyFetcher = () => {
  const {
    getA1CurrentChainTnftSupply,
    getWhitelistMintedCount
  } = useNodeFunctions();
  const { nodeEventCounter } = useNodeEventListeners();
  const ethTimerRef = useRef(null);
  const flareTimerRef = useRef(null);

  // Helper function to convert blockchain numbers
  const convertBlockchainNumber = (value) => {
    if (!value) return 0;
    // If it's a BigNumber object (from ethers.js)
    if (value._isBigNumber) {
      return parseInt(value.toString(), 10);
    }
    // If it's a hexadecimal string
    if (typeof value === 'string' && value.startsWith('0x')) {
      return parseInt(value, 16);
    }
    // If it's already a number or number string
    return parseInt(value, 10);
  };

  // Function to calculate and save total supply and totalCurrentNodes
  const updateTotalSupplyValues = useCallback((ethSupply, flareSupply, whitelistMinted, bscSupply = 0) => {
    const combinedSupply = ethSupply + flareSupply + bscSupply;
    const totalCurrentNodesValue = combinedSupply - whitelistMinted;

    setNodeReadOnlyState({
      totalSupply: combinedSupply,
      totalCurrentNodes: totalCurrentNodesValue
    });

    console.log('Total Combined Supply:', combinedSupply, `(ETH:${ethSupply} Flare:${flareSupply} BSC:${bscSupply})`);
    console.log('Total Current Nodes (minus whitelist):', totalCurrentNodesValue);
  }, []);

  const fetchBscSupply = useCallback(async () => {
    if (!isLocalMode() || !NodeHardhatBsc) return 0;
    try {
      const supply = await NodeHardhatBsc.a1CurrentChainTnftSupply();
      return convertBlockchainNumber(supply);
    } catch (err) {
      return 0;
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      const [ethSupply, flareSupply, flareWhitelistMinted, bscSupply] = await Promise.all([
        getA1CurrentChainTnftSupply('ethereum'),
        getA1CurrentChainTnftSupply('flare'),
        getWhitelistMintedCount('flare'),
        fetchBscSupply()
      ]);

      const convertedEthSupply = convertBlockchainNumber(ethSupply);
      const convertedFlareSupply = convertBlockchainNumber(flareSupply);
      const convertedWhitelistMinted = convertBlockchainNumber(flareWhitelistMinted);

      console.log('Raw ETH Supply:', ethSupply, 'Converted:', convertedEthSupply);
      console.log('Raw Flare Supply:', flareSupply, 'Converted:', convertedFlareSupply);
      if (bscSupply > 0) console.log('BSC Supply:', bscSupply);

      setNodeReadOnlyState({
        ethSupply: convertedEthSupply,
        flareSupply: convertedFlareSupply,
        flareWhitelistMinted: convertedWhitelistMinted
      });

      updateTotalSupplyValues(convertedEthSupply, convertedFlareSupply, convertedWhitelistMinted, bscSupply);
    } catch (error) {
      console.error('Error fetching all data:', error);
    }
  }, [getA1CurrentChainTnftSupply, getWhitelistMintedCount, updateTotalSupplyValues, fetchBscSupply]);

  const fetchEthSupply = useCallback(async () => {
    try {
      const ethSupply = await getA1CurrentChainTnftSupply('ethereum');
      const convertedEthSupply = convertBlockchainNumber(ethSupply);
      console.log('ETH Supply Update:', ethSupply, 'Converted:', convertedEthSupply);
      
      setNodeReadOnlyState({ 
        ethSupply: convertedEthSupply 
      });
      
      // Need flare supply and whitelist count to calculate combined values
      const flareSupply = await getA1CurrentChainTnftSupply('flare');
      const convertedFlareSupply = convertBlockchainNumber(flareSupply);
      
      const whitelistMinted = await getWhitelistMintedCount('flare');
      const convertedWhitelistMinted = convertBlockchainNumber(whitelistMinted);
      
      // Update total supply and totalCurrentNodes
      updateTotalSupplyValues(convertedEthSupply, convertedFlareSupply, convertedWhitelistMinted);
    } catch (error) {
      console.error('Error fetching ETH supply:', error);
    }
  }, [getA1CurrentChainTnftSupply, getWhitelistMintedCount, updateTotalSupplyValues]);

  const fetchFlareSupply = useCallback(async () => {
    try {
      const flareSupply = await getA1CurrentChainTnftSupply('flare');
      const convertedFlareSupply = convertBlockchainNumber(flareSupply);
      console.log('Flare Supply Update:', flareSupply, 'Converted:', convertedFlareSupply);
      
      setNodeReadOnlyState({ 
        flareSupply: convertedFlareSupply 
      });
      
      // Need eth supply and whitelist count to calculate combined values
      const ethSupply = await getA1CurrentChainTnftSupply('ethereum');
      const convertedEthSupply = convertBlockchainNumber(ethSupply);
      
      const whitelistMinted = await getWhitelistMintedCount('flare');
      const convertedWhitelistMinted = convertBlockchainNumber(whitelistMinted);
      
      // Update total supply and totalCurrentNodes
      updateTotalSupplyValues(convertedEthSupply, convertedFlareSupply, convertedWhitelistMinted);
    } catch (error) {
      console.error('Error fetching Flare supply:', error);
    }
  }, [getA1CurrentChainTnftSupply, getWhitelistMintedCount, updateTotalSupplyValues]);

  const fetchFlareWhitelistMinted = useCallback(async () => {
    try {
      const flareWhitelistMinted = await getWhitelistMintedCount('flare');
      const convertedWhitelistMinted = convertBlockchainNumber(flareWhitelistMinted);
      console.log('Flare Whitelist Update:', flareWhitelistMinted, 'Converted:', convertedWhitelistMinted);
      
      setNodeReadOnlyState({ 
        flareWhitelistMinted: convertedWhitelistMinted 
      });
    } catch (error) {
      console.error('Error fetching Flare whitelist count:', error);
    }
  }, [getWhitelistMintedCount]);

  const startEthDataCycle = useCallback(() => {
    const runEthDataFetch = async () => {
      await fetchEthSupply();
      ethTimerRef.current = setTimeout(runEthDataFetch, 12424);
    };
    runEthDataFetch();
  }, [fetchEthSupply]);

  const startFlareDataCycle = useCallback(() => {
    const runFlareDataFetch = async () => {
      await fetchFlareSupply();
      flareTimerRef.current = setTimeout(async () => {
        await fetchFlareWhitelistMinted();
        flareTimerRef.current = setTimeout(runFlareDataFetch, 9245);
      }, 18577);
    };
    runFlareDataFetch();
  }, [fetchFlareSupply, fetchFlareWhitelistMinted]);

  useEffect(() => {
    fetchAllData(); // Initial fetch all on component mount
    startEthDataCycle();
    startFlareDataCycle();

    return () => {
      if (ethTimerRef.current) clearTimeout(ethTimerRef.current);
      if (flareTimerRef.current) clearTimeout(flareTimerRef.current);
    };
  }, [fetchAllData, startEthDataCycle, startFlareDataCycle]);

  useEffect(() => {
    fetchAllData(); // Fetch all whenever nodeEventCounter changes
  }, [nodeEventCounter, fetchAllData]);

  return null;
};

export default NodeReadOnlyFetcher;