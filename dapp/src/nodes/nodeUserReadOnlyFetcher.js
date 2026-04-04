import { useEffect, useCallback, useRef } from 'react';
import { setNodeUserReadOnlyState } from './useNodeUserReadOnlyState';
import useWalletConnection from '../core/useWalletConnection';
import { useNodeFunctions } from './nodeAllFunctions';

const NodeUserReadOnlyFetcher = () => {
  const { getA6AddressEscrowHoldings } = useNodeFunctions();
  const { connected, activeAddress } = useWalletConnection();
  const ethTimerRef = useRef(null);
  const flareTimerRef = useRef(null);

  const fetchAllData = useCallback(async () => {
    if (!connected || !activeAddress) return;

    try {
      const [ethHoldings, flareHoldings] = await Promise.all([
        getA6AddressEscrowHoldings('ethereum', activeAddress),
        getA6AddressEscrowHoldings('flare', activeAddress)
      ]);

      setNodeUserReadOnlyState({
        EthA6AddressEscrowHoldingsResults: ethHoldings,
        FlareA6AddressEscrowHoldingsResults: flareHoldings
      });
    } catch (error) {
      console.error('try again later:', error);
    }
  }, [connected, activeAddress, getA6AddressEscrowHoldings]);

  const fetchEthHoldings = useCallback(async () => {
    if (!connected || !activeAddress) return;

    try {
      const ethHoldings = await getA6AddressEscrowHoldings('ethereum', activeAddress);
      setNodeUserReadOnlyState({ EthA6AddressEscrowHoldingsResults: ethHoldings });
      console.log('getA6AddressEscrowHoldings ETH HeartBeat');
    } catch (error) {
      console.error('not Pong:', error);
    }
  }, [connected, activeAddress, getA6AddressEscrowHoldings]);

  const fetchFlareHoldings = useCallback(async () => {
    if (!connected || !activeAddress) return;

    try {
      const flareHoldings = await getA6AddressEscrowHoldings('flare', activeAddress);
      setNodeUserReadOnlyState({ FlareA6AddressEscrowHoldingsResults: flareHoldings });
      console.log('getA6AddressEscrowHoldings FLR HeartBeat');
    } catch (error) {
      console.error('not Pong:', error);
    }
  }, [connected, activeAddress, getA6AddressEscrowHoldings]);

  const startEthDataCycle = useCallback(() => {
    const runEthDataFetch = async () => {
      await fetchEthHoldings();
      ethTimerRef.current = setTimeout(runEthDataFetch, 8674);
    };

    runEthDataFetch();
  }, [fetchEthHoldings]);

  const startFlareDataCycle = useCallback(() => {
    const runFlareDataFetch = async () => {
      await fetchFlareHoldings();
      flareTimerRef.current = setTimeout(runFlareDataFetch, 8674);
    };

    runFlareDataFetch();
  }, [fetchFlareHoldings]);

  useEffect(() => {
    fetchAllData(); // Initial fetch of all data when component mounts or connection/address changes
    if (connected && activeAddress) {
      startEthDataCycle();
      startFlareDataCycle();
    }

    return () => {
      if (ethTimerRef.current) clearTimeout(ethTimerRef.current);
      if (flareTimerRef.current) clearTimeout(flareTimerRef.current);
    };
  }, [fetchAllData, startEthDataCycle, startFlareDataCycle, connected, activeAddress]);

  return null;
};

export default NodeUserReadOnlyFetcher;