import { useEffect, useCallback, useRef } from 'react';
import { setNodeUserReadOnlyState } from './useNodeUserReadOnlyState';
import useWalletConnection from '../core/useWalletConnection';
import { useNodeFunctions } from './nodeAllFunctions';

const NodeUserReadOnlyFetcher = () => {
  const { getA6AddressEscrowHoldings } = useNodeFunctions();
  const { connected, activeAddress } = useWalletConnection();
  const ethTimerRef = useRef(null);
  const flareTimerRef = useRef(null);
  const bscTimerRef = useRef(null);

  const fetchAllData = useCallback(async () => {
    if (!connected || !activeAddress) return;

    try {
      const [ethHoldings, flareHoldings, bscHoldings] = await Promise.all([
        getA6AddressEscrowHoldings('ethereum', activeAddress),
        getA6AddressEscrowHoldings('flare', activeAddress),
        getA6AddressEscrowHoldings('bsc', activeAddress)
      ]);

      setNodeUserReadOnlyState({
        EthA6AddressEscrowHoldingsResults: ethHoldings,
        FlareA6AddressEscrowHoldingsResults: flareHoldings,
        BscA6AddressEscrowHoldingsResults: bscHoldings
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
    } catch (error) {
      console.error('ETH holdings fetch error:', error);
    }
  }, [connected, activeAddress, getA6AddressEscrowHoldings]);

  const fetchFlareHoldings = useCallback(async () => {
    if (!connected || !activeAddress) return;
    try {
      const flareHoldings = await getA6AddressEscrowHoldings('flare', activeAddress);
      setNodeUserReadOnlyState({ FlareA6AddressEscrowHoldingsResults: flareHoldings });
    } catch (error) {
      console.error('Flare holdings fetch error:', error);
    }
  }, [connected, activeAddress, getA6AddressEscrowHoldings]);

  const fetchBscHoldings = useCallback(async () => {
    if (!connected || !activeAddress) return;
    try {
      const bscHoldings = await getA6AddressEscrowHoldings('bsc', activeAddress);
      setNodeUserReadOnlyState({ BscA6AddressEscrowHoldingsResults: bscHoldings });
    } catch (error) {
      console.error('BSC holdings fetch error:', error);
    }
  }, [connected, activeAddress, getA6AddressEscrowHoldings]);

  const startEthDataCycle = useCallback(() => {
    const run = async () => { await fetchEthHoldings(); ethTimerRef.current = setTimeout(run, 8674); };
    run();
  }, [fetchEthHoldings]);

  const startFlareDataCycle = useCallback(() => {
    const run = async () => { await fetchFlareHoldings(); flareTimerRef.current = setTimeout(run, 8674); };
    run();
  }, [fetchFlareHoldings]);

  const startBscDataCycle = useCallback(() => {
    const run = async () => { await fetchBscHoldings(); bscTimerRef.current = setTimeout(run, 8674); };
    run();
  }, [fetchBscHoldings]);

  useEffect(() => {
    fetchAllData();
    if (connected && activeAddress) {
      startEthDataCycle();
      startFlareDataCycle();
      startBscDataCycle();
    }

    return () => {
      if (ethTimerRef.current) clearTimeout(ethTimerRef.current);
      if (flareTimerRef.current) clearTimeout(flareTimerRef.current);
      if (bscTimerRef.current) clearTimeout(bscTimerRef.current);
    };
  }, [fetchAllData, startEthDataCycle, startFlareDataCycle, startBscDataCycle, connected, activeAddress]);

  return null;
};

export default NodeUserReadOnlyFetcher;
