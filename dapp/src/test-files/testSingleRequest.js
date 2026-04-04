import React, { useState, useEffect, useCallback } from 'react';
import { useReadOnlyFunctions } from '../read-only-functions/readOnlyFunctions';
import { useEventListeners } from '../useEventListeners';

const TestSingleRequest = () => {
  const { getAbCurrentChainTnftSupply } = useReadOnlyFunctions();
  const { ethMintListenerOccurred } = useEventListeners();

  const [ethSupply, setEthSupply] = useState([0, 0, 0, 0]);
  const [flareSupply, setFlareSupply] = useState([0, 0, 0, 0]);

  const fetchData = useCallback(async () => {
    try {
      const ethResult = await getAbCurrentChainTnftSupply('ethereum');
      const flareResult = await getAbCurrentChainTnftSupply('flare');
      return { ethResult, flareResult };
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  }, [getAbCurrentChainTnftSupply]);

  const processSupply = useCallback((supply) => {
    return supply.map(val => parseInt(val.toString()));
  }, []);

  const updateState = useCallback((data) => {
    if (data) {
      if (data.ethResult) {
        setEthSupply(processSupply(data.ethResult));
      }
      if (data.flareResult) {
        setFlareSupply(processSupply(data.flareResult));
      }
    }
  }, [processSupply]);

  const handleDataUpdate = useCallback(async () => {
    const data = await fetchData();
    updateState(data);
  }, [fetchData, updateState]);

  useEffect(() => {
    handleDataUpdate();
  }, [handleDataUpdate]);

  useEffect(() => {
    if (ethMintListenerOccurred) {
      handleDataUpdate();
    }
  }, [ethMintListenerOccurred, handleDataUpdate]);

  return (
    <div>
      Ethereum: {ethSupply.join(',')}
      <br />
      Flare: {flareSupply.join(',')}
    </div>
  );
};

export default TestSingleRequest;