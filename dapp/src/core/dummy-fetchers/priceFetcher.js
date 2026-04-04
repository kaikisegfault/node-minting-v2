import { useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { FlarePriceInteraction } from '../contractInteractions';
import { setPriceState } from '../usePrices';
import { setNodePriceState } from '../../nodes/useNodePrices';

const FEED_INDEXES = [0, 9]; // Indices for FLR/USD and ETH/USD

const fetchBnbPrice = async () => {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
    const data = await res.json();
    return data.binancecoin?.usd || 0;
  } catch (err) {
    console.error('BNB price fetch failed:', err);
    return 0;
  }
};

const PriceFetcher = () => {
  const fetchPrices = useCallback(async () => {
    try {
      const [feedResult, bnbPrice] = await Promise.all([
        FlarePriceInteraction.fetchCurrentFeeds(FEED_INDEXES),
        fetchBnbPrice()
      ]);

      const [feeds, decimals] = feedResult;

      const flrIndex = decimals.findIndex(dec => dec === 7);
      const ethIndex = decimals.findIndex(dec => dec === 3);

      if (flrIndex === -1 || ethIndex === -1) {
        console.error("Price feed indices not found.");
        return;
      }

      const flrFeed = feeds[flrIndex];
      const ethFeed = feeds[ethIndex];
      const flrDecimals = decimals[flrIndex];
      const ethDecimals = decimals[ethIndex];

      const flrPrice = Number(ethers.utils.formatUnits(flrFeed, flrDecimals));
      const ethPrice = Number(ethers.utils.formatUnits(ethFeed, ethDecimals));

      const rawPrices = {
        ethUsd: ethPrice,
        flrUsd: flrPrice,
        bnbUsd: bnbPrice,
      };

      setPriceState(rawPrices);
      setNodePriceState(rawPrices);

      console.log("Raw prices fetched successfully", { ethPrice, flrPrice, bnbPrice });
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  }, []);

  useEffect(() => {
    fetchPrices(); // Fetch prices immediately when component mounts
    const interval = setInterval(fetchPrices, 30000); // Then fetch every 30 seconds

    return () => {
      clearInterval(interval);
      console.log("Cleaned up price fetching interval");
    };
  }, [fetchPrices]);

  return null; // This component doesn't render anything
};

export default PriceFetcher;