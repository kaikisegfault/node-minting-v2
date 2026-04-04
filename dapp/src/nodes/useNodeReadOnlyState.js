import { useState, useEffect } from 'react';

let nodeReadOnlyState = {
  EthA1CurrentChainTnftSupplyResults: 0,
  FlareA1CurrentChainTnftSupplyResults: 0,
  FlareWhitelistMintedCountResults: 0,
  totalSupply: 0,
  totalCurrentNodes: 0
};

let listeners = [];

export const setNodeReadOnlyState = (newData) => {
  nodeReadOnlyState = {
    ...nodeReadOnlyState,
    ...(newData.ethSupply !== undefined ? { EthA1CurrentChainTnftSupplyResults: newData.ethSupply } : {}),
    ...(newData.flareSupply !== undefined ? { FlareA1CurrentChainTnftSupplyResults: newData.flareSupply } : {}),
    ...(newData.flareWhitelistMinted !== undefined ? { FlareWhitelistMintedCountResults: newData.flareWhitelistMinted } : {}),
    ...(newData.totalSupply !== undefined ? { totalSupply: newData.totalSupply } : {}),
    ...(newData.totalCurrentNodes !== undefined ? { totalCurrentNodes: newData.totalCurrentNodes } : {})
  };

  listeners.forEach(listener => listener(nodeReadOnlyState));
};

export const useNodeReadOnly = () => {
  const [data, setData] = useState(nodeReadOnlyState);

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

export default useNodeReadOnly;