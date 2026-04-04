import { useCallback } from 'react';
import { useReadOnlyFunctions } from '../readOnlyFunctions';
import useWalletConnection from '../useWalletConnection';

const useCrossChainBalance = () => {
  const { network } = useWalletConnection();
  const { 
    getAbCurrentChainTnftSupply, 
    getAbOtherChainsTnftSupply 
  } = useReadOnlyFunctions();

  const checkCrossChainBalance = useCallback(async () => {
    try {
      const currentNetwork = network.toLowerCase();
      const oppositeNetwork = currentNetwork === 'ethereum' ? 'flare' : 'ethereum';

      const currentChainSupply = await getAbCurrentChainTnftSupply(oppositeNetwork);
      console.log(`[${oppositeNetwork}] abCurrentChainTnftSupply: [${currentChainSupply.join(', ')}]`);

      const otherChainSupply = await getAbOtherChainsTnftSupply(currentNetwork);
      console.log(`[${currentNetwork}] abOtherChainsTnftSupply: [${otherChainSupply.join(', ')}]`);

      const otherChainsTnftMint = currentChainSupply.map((current, index) => {
        const diff = parseInt(current) - parseInt(otherChainSupply[index]);
        return diff > 0 ? diff : 0;
      });

      console.log(`[${currentNetwork}] otherChainsTnftMint: [${otherChainsTnftMint.join(', ')}]`);

      return {
        success: true,
        otherChainsTnftMint,
        otherChainTnftIds: [1, 2, 3, 4]
      };
    } catch (error) {
      console.error("Error in cross-chain balance check:", error);
      return {
        success: false,
        error: "Cross-Chain Balance Check Failed. Please try again."
      };
    }
  }, [network, getAbCurrentChainTnftSupply, getAbOtherChainsTnftSupply]);

  return { checkCrossChainBalance };
};

export default useCrossChainBalance;