import { useState, useEffect } from 'react';

let mainReadOnlyState = {
  EthAbCurrentChainTnftSupplyResults: { bronze: 0, silver: 0, gold: 0, diamond: 0 },
  FlareAbCurrentChainTnftSupplyResults: { bronze: 0, silver: 0, gold: 0, diamond: 0 },
  EthAbCurrentChainTerc20SupplyAsTnftResult: 0,
  FlareAbCurrentChainTerc20SupplyAsTnftResult: 0,
  // Add minerals state
  getMineralsGeneralInfoResults: {
    validatedMineralsQty: 0,
    unvalidatedMineralsQty: 0
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
  validatedMineralsQty: parseInt(info?.[0]?.toString() || '0'),
  unvalidatedMineralsQty: parseInt(info?.[1]?.toString() || '0')
});

export const setMainReadOnlyState = (newData) => {
  mainReadOnlyState = {
    ...mainReadOnlyState,
    ...(newData.ethSupply ? { EthAbCurrentChainTnftSupplyResults: processSupply(newData.ethSupply) } : {}),
    ...(newData.flareSupply ? { FlareAbCurrentChainTnftSupplyResults: processSupply(newData.flareSupply) } : {}),
    ...(newData.ethTerc20Supply ? { EthAbCurrentChainTerc20SupplyAsTnftResult: parseInt(newData.ethTerc20Supply.toString() || '0') } : {}),
    ...(newData.flareTerc20Supply ? { FlareAbCurrentChainTerc20SupplyAsTnftResult: parseInt(newData.flareTerc20Supply.toString() || '0') } : {}),
    ...(newData.mineralsGeneralInfo ? { getMineralsGeneralInfoResults: processMineralsInfo(newData.mineralsGeneralInfo) } : {})
  };

  listeners.forEach(listener => listener(mainReadOnlyState));
};

export const useMainReadOnly = () => {
  const [data, setData] = useState(mainReadOnlyState);

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

export default useMainReadOnly;