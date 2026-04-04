import { useEffect, useCallback, useRef } from 'react';
import { useReadOnlyFunctions } from '../readOnlyFunctions';
import { setUserReadOnlyState } from '../useUserReadOnlyState';
import useWalletConnection from '../useWalletConnection';

const UserReadOnlyFetcher = () => {
  const { 
    getBalanceOfBatch, 
    getCurrentChainAddressTotalTerc20AsTnft,
    getMineralsAddressInfo  // Add new minerals function
  } = useReadOnlyFunctions();
  const { connected, activeAddress } = useWalletConnection();
  const ethTimerRef = useRef(null);
  const flareTimerRef = useRef(null);
  const mineralsTimerRef = useRef(null);  // New timer ref for minerals

  const fetchAllData = useCallback(async () => {
    if (!connected || !activeAddress) return;

    try {
      const [ethBalance, flareBalance, ethTotal, flareTotal, mineralsAddressInfo] = await Promise.all([
        getBalanceOfBatch('ethereum', activeAddress),
        getBalanceOfBatch('flare', activeAddress),
        getCurrentChainAddressTotalTerc20AsTnft('ethereum', activeAddress),
        getCurrentChainAddressTotalTerc20AsTnft('flare', activeAddress),
        getMineralsAddressInfo(activeAddress)  // Add minerals fetch
      ]);

      setUserReadOnlyState({
        EthBalanceOfBatchResults: ethBalance,
        FlareBalanceOfBatchResults: flareBalance,
        EthCurrentChainAddressTotalTerc20AsTnftResult: ethTotal,
        FlareCurrentChainAddressTotalTerc20AsTnftResult: flareTotal,
        mineralsAddressInfoResults: mineralsAddressInfo  // Add to state update
      });
    } catch (error) {
      console.error('try again later:', error);
    }
  }, [connected, activeAddress, getBalanceOfBatch, getCurrentChainAddressTotalTerc20AsTnft, getMineralsAddressInfo]);

  // Keep existing fetch functions unchanged
  const fetchEthBalance = useCallback(async () => {
    if (!connected || !activeAddress) return;

    try {
      const ethBalance = await getBalanceOfBatch('ethereum', activeAddress);
      setUserReadOnlyState({ EthBalanceOfBatchResults: ethBalance });
      console.log('getBalanceOfBatch ETH HeartBeat');
    } catch (error) {
      console.error('not Pong:', error);
    }
  }, [connected, activeAddress, getBalanceOfBatch]);

  const fetchEthTotal = useCallback(async () => {
    if (!connected || !activeAddress) return;

    try {
      const ethTotal = await getCurrentChainAddressTotalTerc20AsTnft('ethereum', activeAddress);
      setUserReadOnlyState({ EthCurrentChainAddressTotalTerc20AsTnftResult: ethTotal });
      console.log('getCurrentChainAddressTotalTerc20AsTnft ETH HeartBeat');
    } catch (error) {
      console.error('not Pong:', error);
    }
  }, [connected, activeAddress, getCurrentChainAddressTotalTerc20AsTnft]);

  const fetchFlareBalance = useCallback(async () => {
    if (!connected || !activeAddress) return;

    try {
      const flareBalance = await getBalanceOfBatch('flare', activeAddress);
      setUserReadOnlyState({ FlareBalanceOfBatchResults: flareBalance });
      console.log('getBalanceOfBatch FLR HeartBeat');
    } catch (error) {
      console.error('not Pong:', error);
    }
  }, [connected, activeAddress, getBalanceOfBatch]);

  const fetchFlareTotal = useCallback(async () => {
    if (!connected || !activeAddress) return;

    try {
      const flareTotal = await getCurrentChainAddressTotalTerc20AsTnft('flare', activeAddress);
      setUserReadOnlyState({ FlareCurrentChainAddressTotalTerc20AsTnftResult: flareTotal });
      console.log('getCurrentChainAddressTotalTerc20AsTnft FLR HeartBeat');
    } catch (error) {
      console.error('not Pong:', error);
    }
  }, [connected, activeAddress, getCurrentChainAddressTotalTerc20AsTnft]);

  // Add new minerals fetch function
  const fetchMineralsAddressInfo = useCallback(async () => {
    if (!connected || !activeAddress) return;

    try {
      const mineralsInfo = await getMineralsAddressInfo(activeAddress);
      setUserReadOnlyState({ mineralsAddressInfoResults: mineralsInfo });
      console.log('getMineralsAddressInfo HeartBeat');
    } catch (error) {
      console.error('not Pong:', error);
    }
  }, [connected, activeAddress, getMineralsAddressInfo]);

  const startEthDataCycle = useCallback(() => {
    const runEthDataFetch = async () => {
      await fetchEthBalance();
      ethTimerRef.current = setTimeout(async () => {
        await fetchEthTotal();
        ethTimerRef.current = setTimeout(runEthDataFetch, 9654);
      }, 18014);
    };

    runEthDataFetch();
  }, [fetchEthBalance, fetchEthTotal]);

  const startFlareDataCycle = useCallback(() => {
    const runFlareDataFetch = async () => {
      await fetchFlareBalance();
      flareTimerRef.current = setTimeout(async () => {
        await fetchFlareTotal();
        flareTimerRef.current = setTimeout(runFlareDataFetch, 9654);
      }, 18014);
    };

    runFlareDataFetch();
  }, [fetchFlareBalance, fetchFlareTotal]);

  // Add new minerals cycle
  const startMineralsDataCycle = useCallback(() => {
    const runMineralsDataFetch = async () => {
      await fetchMineralsAddressInfo();
      mineralsTimerRef.current = setTimeout(runMineralsDataFetch, 9654);
    };

    runMineralsDataFetch();
  }, [fetchMineralsAddressInfo]);

  useEffect(() => {
    fetchAllData(); // Initial fetch of all when component mounts or connection/address changes
    if (connected && activeAddress) {
      startEthDataCycle();
      startFlareDataCycle();
      startMineralsDataCycle();  // Start minerals cycle
    }

    return () => {
      if (ethTimerRef.current) clearTimeout(ethTimerRef.current);
      if (flareTimerRef.current) clearTimeout(flareTimerRef.current);
      if (mineralsTimerRef.current) clearTimeout(mineralsTimerRef.current);
    };
  }, [fetchAllData, startEthDataCycle, startFlareDataCycle, startMineralsDataCycle, connected, activeAddress]);

  return null;
};

export default UserReadOnlyFetcher;