import { useEffect, useCallback } from 'react';
import { useReadOnlyFunctions } from '../readOnlyFunctions';
import { setUserReadOnlyState } from '../useUserReadOnlyState';
import useWalletConnection from '../useWalletConnection';

const FlareAddressWsHeartbeat = () => {
  const { getBalanceOfBatch, getCurrentChainAddressTotalTerc20AsTnft } = useReadOnlyFunctions();
  const { connected, activeAddress } = useWalletConnection();

  const fetchData = useCallback(async () => {
    if (!connected || !activeAddress) {
      console.log('Skipping data fetch, no active address');
      return;
    }

    try {
      console.log('Fetching data with active address:', activeAddress);
      const [ethBalance, flareBalance, ethTotal, flareTotal] = await Promise.all([
        getBalanceOfBatch('ethereum', activeAddress),
        getBalanceOfBatch('flare', activeAddress),
        getCurrentChainAddressTotalTerc20AsTnft('ethereum', activeAddress),
        getCurrentChainAddressTotalTerc20AsTnft('flare', activeAddress)
      ]);

      setUserReadOnlyState({
        EthBalanceOfBatchResults: ethBalance,
        FlareBalanceOfBatchResults: flareBalance,
        EthCurrentChainAddressTotalTerc20AsTnftResult: ethTotal,
        FlareCurrentChainAddressTotalTerc20AsTnftResult: flareTotal
      });
      console.log('Data fetched successfully');
    } catch (error) {
      console.error('Error fetching user-specific data:', error);
    }
  }, [connected, activeAddress, getBalanceOfBatch, getCurrentChainAddressTotalTerc20AsTnft]);

  useEffect(() => {
    const intervalId = setInterval(fetchData, 5000); // Fetch data every 5 seconds

    return () => {
      clearInterval(intervalId); // Clean up the interval on component unmount
    };
  }, [fetchData]);

  return null;
};

export default FlareAddressWsHeartbeat;