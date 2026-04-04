import { useState, useEffect, useMemo } from 'react';

// NFT price constants
const NFT_PRICES_USD = {
  BRONZE: 80,
  SILVER: 720, 
  GOLD: 5760,
  DIAMOND: 40320
};

// Shared state for prices
let priceState = {
  ethUsd: 0,
  flrUsd: 0,
  lastUpdateTimestamp: 0,
};

// List of listeners to notify when prices change
let listeners = [];

// Function to update the shared state and notify listeners
export const setPriceState = (newPrices) => {
  priceState = { 
    ...priceState, 
    ...newPrices, 
    lastUpdateTimestamp: Date.now() 
  };
  listeners.forEach(listener => listener(priceState));
};

// Hook to access and calculate prices
export const usePrices = () => {
  const [rawPrices, setRawPrices] = useState(priceState);

  useEffect(() => {
    // Listener to update prices when priceState changes
    const listener = (newPrices) => {
      setRawPrices(newPrices);
    };

    listeners.push(listener);

    // Clean up listener on unmount
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  // Calculate NFT prices based on raw prices
  const calculatedPrices = useMemo(() => {
    const { ethUsd, flrUsd } = rawPrices;

    const calculateNftPrices = basePrice => ({
      BRONZE: NFT_PRICES_USD.BRONZE / basePrice,
      SILVER: NFT_PRICES_USD.SILVER / basePrice,
      GOLD: NFT_PRICES_USD.GOLD / basePrice,
      DIAMOND: NFT_PRICES_USD.DIAMOND / basePrice
    });

    const ethNftPrices = calculateNftPrices(ethUsd);
    const flrNftPrices = calculateNftPrices(flrUsd);

    return {
      // Raw prices
      ethUsd,
      flrUsd,
      lastUpdateTimestamp: rawPrices.lastUpdateTimestamp,
      
      // Calculated ETH prices
      bronzePriceETH: ethNftPrices.BRONZE,
      silverPriceETH: ethNftPrices.SILVER,
      goldPriceETH: ethNftPrices.GOLD,
      diamondPriceETH: ethNftPrices.DIAMOND,
      
      // Calculated FLR prices
      bronzePriceFLR: flrNftPrices.BRONZE,
      silverPriceFLR: flrNftPrices.SILVER,
      goldPriceFLR: flrNftPrices.GOLD,
      diamondPriceFLR: flrNftPrices.DIAMOND,
    };
  }, [rawPrices]);

  return calculatedPrices;
};

export default usePrices;