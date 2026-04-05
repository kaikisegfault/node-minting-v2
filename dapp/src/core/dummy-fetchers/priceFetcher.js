import { useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { FlarePriceInteraction } from '../contractInteractions';
import { setPriceState } from '../usePrices';
import { setNodePriceState } from '../../nodes/useNodePrices';

const FEED_INDEXES = [0, 9, 13]; // Indices for FLR/USD, ETH/USD, BNB/USD

const PriceFetcher = () => {
  const fetchPrices = useCallback(async () => {
    try {
      const [feeds, decimals] = await FlarePriceInteraction.fetchCurrentFeeds(FEED_INDEXES);

      const flrPrice = Number(ethers.utils.formatUnits(feeds[0], decimals[0]));
      const ethPrice = Number(ethers.utils.formatUnits(feeds[1], decimals[1]));
      const bnbPrice = Number(ethers.utils.formatUnits(feeds[2], decimals[2]));

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