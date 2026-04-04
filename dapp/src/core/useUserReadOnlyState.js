import { useState, useEffect } from 'react';

const defaultBalanceState = { bronze: 0, silver: 0, gold: 0, diamond: 0 };

let userReadOnlyState = {
  EthBalanceOfBatchResults: { ...defaultBalanceState },
  FlareBalanceOfBatchResults: { ...defaultBalanceState },
  EthCurrentChainAddressTotalTerc20AsTnftResult: 0,
  FlareCurrentChainAddressTotalTerc20AsTnftResult: 0,
  mineralsAddressInfoResults: {
    myValidatedMineralsQty: 0,
    myUnvalidatedMineralsQty: 0
  }
};

let listeners = [];

const processSupply = (supply) => ({
  bronze: parseInt(supply?.[0]?.toString() || '0'),
  silver: parseInt(supply?.[1]?.toString() || '0'),
  gold: parseInt(supply?.[2]?.toString() || '0'),
  diamond: parseInt(supply?.[3]?.toString() || '0')
});

const processMineralsInfo = (info) => ({
  myValidatedMineralsQty: parseInt(info?.[0]?.toString() || '0'),
  myUnvalidatedMineralsQty: parseInt(info?.[1]?.toString() || '0')
});

export const setUserReadOnlyState = (newData) => {
  userReadOnlyState = {
    ...userReadOnlyState,
    ...(newData.EthBalanceOfBatchResults ? { EthBalanceOfBatchResults: processSupply(newData.EthBalanceOfBatchResults) } : {}),
    ...(newData.FlareBalanceOfBatchResults ? { FlareBalanceOfBatchResults: processSupply(newData.FlareBalanceOfBatchResults) } : {}),
    ...(newData.EthCurrentChainAddressTotalTerc20AsTnftResult !== undefined ? { EthCurrentChainAddressTotalTerc20AsTnftResult: parseInt(newData.EthCurrentChainAddressTotalTerc20AsTnftResult.toString() || '0') } : {}),
    ...(newData.FlareCurrentChainAddressTotalTerc20AsTnftResult !== undefined ? { FlareCurrentChainAddressTotalTerc20AsTnftResult: parseInt(newData.FlareCurrentChainAddressTotalTerc20AsTnftResult.toString() || '0') } : {}),
    ...(newData.mineralsAddressInfoResults !== undefined ? { mineralsAddressInfoResults: processMineralsInfo(newData.mineralsAddressInfoResults) } : {})
  };

  listeners.forEach(listener => listener(userReadOnlyState));
};

export const useUserReadOnlyState = () => {
  const [data, setData] = useState(userReadOnlyState);

  useEffect(() => {
    const listener = (newData) => {
      setData(newData);
    };

    listeners.push(listener);

    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return data;
};

export default useUserReadOnlyState;