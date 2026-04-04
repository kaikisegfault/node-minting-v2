import { useEffect, useCallback, useRef } from 'react';
import { useReadOnlyFunctions } from '../readOnlyFunctions';
import { setMainReadOnlyState } from '../useReadOnlyState';
import { useEventListeners } from '../useEventListeners';

const ReadOnlyFetcher = () => {
  const {
    getAbCurrentChainTnftSupply,
    getAbCurrentChainTerc20SupplyAsTnft,
    getMineralsGeneralInfo
  } = useReadOnlyFunctions();
  const { eventCounter } = useEventListeners();
  const ethTimerRef = useRef(null);
  const flareTimerRef = useRef(null);
  const mineralsTimerRef = useRef(null);

  const fetchAllData = useCallback(async () => {
    try {
      const [ethSupply, flareSupply, ethTerc20Supply, flareTerc20Supply, mineralsInfo] = await Promise.all([
        getAbCurrentChainTnftSupply('ethereum'),
        getAbCurrentChainTnftSupply('flare'),
        getAbCurrentChainTerc20SupplyAsTnft('ethereum'),
        getAbCurrentChainTerc20SupplyAsTnft('flare'),
        getMineralsGeneralInfo()
      ]);
      
      setMainReadOnlyState({
        ethSupply,
        flareSupply,
        ethTerc20Supply,
        flareTerc20Supply,
        mineralsGeneralInfo: mineralsInfo
      });
    } catch (error) {
      console.error('try again later:', error);
    }
  }, [getAbCurrentChainTnftSupply, getAbCurrentChainTerc20SupplyAsTnft, getMineralsGeneralInfo]);

  const fetchEthSupply = useCallback(async () => {
    try {
      const ethSupply = await getAbCurrentChainTnftSupply('ethereum');
      setMainReadOnlyState({ ethSupply });
      console.log('getAbCurrentChainTnftSupply ETH HeartBeat');
    } catch (error) {
      console.error('not Pong:', error);
    }
  }, [getAbCurrentChainTnftSupply]);

  const fetchEthTerc20Supply = useCallback(async () => {
    try {
      const ethTerc20Supply = await getAbCurrentChainTerc20SupplyAsTnft('ethereum');
      setMainReadOnlyState({ ethTerc20Supply });
      console.log('getAbCurrentChainTerc20SupplyAsTnft ETH HeartBeat');
    } catch (error) {
      console.error('not Pong:', error);
    }
  }, [getAbCurrentChainTerc20SupplyAsTnft]);

  const fetchFlareSupply = useCallback(async () => {
    try {
      const flareSupply = await getAbCurrentChainTnftSupply('flare');
      setMainReadOnlyState({ flareSupply });
      console.log('getAbCurrentChainTnftSupply FLR HeartBeat');
    } catch (error) {
      console.error('not Pong:', error);
    }
  }, [getAbCurrentChainTnftSupply]);

  const fetchFlareTerc20Supply = useCallback(async () => {
    try {
      const flareTerc20Supply = await getAbCurrentChainTerc20SupplyAsTnft('flare');
      setMainReadOnlyState({ flareTerc20Supply });
      console.log('getAbCurrentChainTerc20SupplyAsTnft FLR HeartBeat');
    } catch (error) {
      console.error('not Pong:', error);
    }
  }, [getAbCurrentChainTerc20SupplyAsTnft]);

  const fetchMineralsInfo = useCallback(async () => {
    try {
      const mineralsInfo = await getMineralsGeneralInfo();
      setMainReadOnlyState({ mineralsGeneralInfo: mineralsInfo });
      console.log('getMineralsGeneralInfo HeartBeat');
    } catch (error) {
      console.error('not Pong:', error);
    }
  }, [getMineralsGeneralInfo]);

  const startEthDataCycle = useCallback(() => {
    const runEthDataFetch = async () => {
      await fetchEthSupply();
      ethTimerRef.current = setTimeout(async () => {
        await fetchEthTerc20Supply();
        ethTimerRef.current = setTimeout(runEthDataFetch, 9245);
      }, 18577);
    };

    runEthDataFetch();
  }, [fetchEthSupply, fetchEthTerc20Supply]);

  const startFlareDataCycle = useCallback(() => {
    const runFlareDataFetch = async () => {
      await fetchFlareSupply();
      flareTimerRef.current = setTimeout(async () => {
        await fetchFlareTerc20Supply();
        flareTimerRef.current = setTimeout(runFlareDataFetch, 9245);
      }, 18577);
    };

    runFlareDataFetch();
  }, [fetchFlareSupply, fetchFlareTerc20Supply]);

  const startMineralsDataCycle = useCallback(() => {
    const runMineralsDataFetch = async () => {
      await fetchMineralsInfo();
      mineralsTimerRef.current = setTimeout(runMineralsDataFetch, 12245);
    };

    runMineralsDataFetch();
  }, [fetchMineralsInfo]);

  useEffect(() => {
    fetchAllData(); // Initial fetch all on component mount
    startEthDataCycle();
    startFlareDataCycle();
    startMineralsDataCycle();

    return () => {
      if (ethTimerRef.current) clearTimeout(ethTimerRef.current);
      if (flareTimerRef.current) clearTimeout(flareTimerRef.current);
      if (mineralsTimerRef.current) clearTimeout(mineralsTimerRef.current);
    };
  }, [fetchAllData, startEthDataCycle, startFlareDataCycle, startMineralsDataCycle]);

  useEffect(() => {
    fetchAllData(); // Fetch all whenever eventCounter changes
  }, [eventCounter, fetchAllData]);

  return null;
};

export default ReadOnlyFetcher;