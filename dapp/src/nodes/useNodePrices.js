import { useState, useEffect, useMemo } from 'react';
import { useNodeReadOnly } from './useNodeReadOnlyState';

// Pricing constants from the contract
const PRICE_STEP_SIZE = 100;
const TIER1_END = 1000;
const TIER2_END = 2800;

const TIER1_START_PRICE = 1;
const TIER1_STEP = 1;
const TIER2_START_PRICE = 15;
const TIER2_STEP = 5;
const TIER3_START_PRICE = 110;
const TIER3_STEP = 10;

// Shared state for raw prices
let nodePriceState = {
  ethUsd: 0,
  flrUsd: 0,
  bnbUsd: 0,
  lastUpdateTimestamp: 0,
  dataReady: false
};

let listeners = [];

export const setNodePriceState = (newPrices) => {
  nodePriceState = { 
    ...nodePriceState, 
    ...newPrices, 
    lastUpdateTimestamp: Date.now(),
    dataReady: newPrices.ethUsd > 0 && newPrices.flrUsd > 0
  };
  listeners.forEach(listener => listener(nodePriceState));
};

export const useNodePrices = () => {
  const [rawPrices, setRawPrices] = useState(nodePriceState);
  const nodeData = useNodeReadOnly();
  const [isDataComplete, setIsDataComplete] = useState(false);

  useEffect(() => {
    const listener = (newPrices) => {
      setRawPrices(newPrices);
    };

    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  // Check if all required blockchain data is available
  useEffect(() => {
    const hasPriceData = rawPrices.ethUsd > 0 && rawPrices.flrUsd > 0;
    const hasValidTotal = nodeData.totalCurrentNodes >= 0;

    setIsDataComplete(hasPriceData && hasValidTotal);
  }, [nodeData, rawPrices]);

  const prices = useMemo(() => {
    const { ethUsd, flrUsd, bnbUsd } = rawPrices;

    // Use the pre-calculated totalCurrentNodes value from state
    const totalCurrentNodes = nodeData.totalCurrentNodes;
    
    // Calculate price based on the next node to be minted
    const nextNodeId = totalCurrentNodes + 1;

    // Calculate current USD price based on tier system
    let currentNodePriceUSD;
    if (nextNodeId <= TIER1_END) {
      const step = Math.floor((nextNodeId - 1) / PRICE_STEP_SIZE);
      currentNodePriceUSD = TIER1_START_PRICE + (step * TIER1_STEP);
    } else if (nextNodeId <= TIER2_END) {
      const step = Math.floor((nextNodeId - TIER1_END - 1) / PRICE_STEP_SIZE);
      currentNodePriceUSD = TIER2_START_PRICE + (step * TIER2_STEP);
    } else {
      const step = Math.floor((nextNodeId - TIER2_END - 1) / PRICE_STEP_SIZE);
      currentNodePriceUSD = TIER3_START_PRICE + (step * TIER3_STEP);
    }

    // Calculate remaining nodes in current tier using totalCurrentNodes
    const remainingNodesInThisTier = PRICE_STEP_SIZE - (totalCurrentNodes % PRICE_STEP_SIZE);

    // Calculate next tier price
    let nextTierPriceUSD;
    if (nextNodeId <= TIER1_END) {
      nextTierPriceUSD = currentNodePriceUSD + TIER1_STEP;
    } else if (nextNodeId <= TIER2_END) {
      nextTierPriceUSD = currentNodePriceUSD + TIER2_STEP;
    } else {
      nextTierPriceUSD = currentNodePriceUSD + TIER3_STEP;
    }

    return {
      currentNodePriceUSD,
      currentNodePriceETH: ethUsd > 0 ? currentNodePriceUSD / ethUsd : 0,
      currentNodePriceFLR: flrUsd > 0 ? currentNodePriceUSD / flrUsd : 0,
      currentNodePriceBNB: bnbUsd > 0 ? currentNodePriceUSD / bnbUsd : 0,
      remainingNodesInThisTier,
      nextTierPriceUSD,
      EthUsdConversion: ethUsd,
      FlrUsdConversion: flrUsd,
      BnbUsdConversion: bnbUsd,
      isDataComplete,
      lastUpdateTimestamp: rawPrices.lastUpdateTimestamp
    };
  }, [rawPrices, nodeData, isDataComplete]);

  return prices;
};

export default useNodePrices;