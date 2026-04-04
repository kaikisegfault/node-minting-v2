import { useEffect, useCallback } from 'react';
import { useReadOnlyFunctions } from '../readOnlyFunctions';
import { setMainReadOnlyState } from '../useReadOnlyState';

const FlareWsHeartbeat = () => {
  const { getAbCurrentChainTnftSupply, getAbCurrentChainTerc20SupplyAsTnft } = useReadOnlyFunctions();

  const fetchFlareSupply = useCallback(async () => {
    try {
      const flareSupply = await getAbCurrentChainTnftSupply('flare');

      setMainReadOnlyState((prevState) => ({
        ...prevState,
        flareSupply,
      }));

      console.log('getAbCurrentChainTnftSupply fetched for Flare');
    } catch (error) {
      console.error('Error fetching Flare TNFT supply:', error);
    }
  }, [getAbCurrentChainTnftSupply]);

  const fetchFlareTerc20Supply = useCallback(async () => {
    try {
      const flareTerc20Supply = await getAbCurrentChainTerc20SupplyAsTnft('flare');

      setMainReadOnlyState((prevState) => ({
        ...prevState,
        flareTerc20Supply,
      }));

      console.log('getAbCurrentChainTerc20SupplyAsTnft fetched for Flare');
    } catch (error) {
      console.error('Error fetching Flare TERC20 supply:', error);
    }
  }, [getAbCurrentChainTerc20SupplyAsTnft]);

  useEffect(() => {
    const executeFetchSequence = async () => {
      await fetchFlareSupply(); // Fetch Flare TNFT supply first

      setTimeout(async () => {
        await fetchFlareTerc20Supply(); // Fetch Flare TERC20 supply after 10 seconds
        executeFetchSequence(); // Restart the sequence after fetching TERC20 supply
      }, 10000);
    };

    executeFetchSequence(); // Start the fetch sequence on component mount

    return () => {
      // Cleanup if necessary
    };
  }, [fetchFlareSupply, fetchFlareTerc20Supply]);

  return null;
};

export default FlareWsHeartbeat;
