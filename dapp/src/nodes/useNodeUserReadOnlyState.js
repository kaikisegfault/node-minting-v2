import { useState, useEffect } from 'react';

// Default state structure matching the contract return values
const defaultEscrowState = {
  address: '',
  status: '',
  related1: '',
  related1Status: '',
  related2: '',
  related2Status: '',
  total: 0,
  ids: [],
  pulled: false
};

let nodeUserReadOnlyState = {
  EthA6AddressEscrowHoldingsResults: { ...defaultEscrowState },
  FlareA6AddressEscrowHoldingsResults: { ...defaultEscrowState },
  BscA6AddressEscrowHoldingsResults: { ...defaultEscrowState }
};

let listeners = [];

const processEscrowHoldings = (data) => ({
  address: data?.[0]?.toString() || '',
  status: data?.[1]?.toString() || '',
  related1: data?.[2]?.toString() || '',
  related1Status: data?.[3]?.toString() || '',
  related2: data?.[4]?.toString() || '',
  related2Status: data?.[5]?.toString() || '',
  total: parseInt(data?.[6]?.toString() || '0'),
  ids: data?.[7] || [],
  pulled: data?.[8] || false
});

export const setNodeUserReadOnlyState = (newData) => {
  nodeUserReadOnlyState = {
    ...nodeUserReadOnlyState,
    ...(newData.EthA6AddressEscrowHoldingsResults ? 
      { EthA6AddressEscrowHoldingsResults: processEscrowHoldings(newData.EthA6AddressEscrowHoldingsResults) } : {}),
    ...(newData.FlareA6AddressEscrowHoldingsResults ?
      { FlareA6AddressEscrowHoldingsResults: processEscrowHoldings(newData.FlareA6AddressEscrowHoldingsResults) } : {}),
    ...(newData.BscA6AddressEscrowHoldingsResults ?
      { BscA6AddressEscrowHoldingsResults: processEscrowHoldings(newData.BscA6AddressEscrowHoldingsResults) } : {})
  };

  listeners.forEach(listener => listener(nodeUserReadOnlyState));
};

export const useNodeUserReadOnlyState = () => {
  const [data, setData] = useState(nodeUserReadOnlyState);

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

export default useNodeUserReadOnlyState;