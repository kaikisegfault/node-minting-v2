import { useCallback } from 'react';
import useCrossChainBalance from './useCrossChainBalance';
import useWalletConnection from '../useWalletConnection';
import useApiCommunicator from './useApiCommunicator';
import useWeb3Injection from './useWeb3Injection';

const useMintProcess = (updateNotification) => {
  const { checkCrossChainBalance } = useCrossChainBalance();
  const { network, activeAddress } = useWalletConnection();
  const { generateRandomNonce, communicateWithApi } = useApiCommunicator();
  const { injectToWeb3 } = useWeb3Injection();

  const executeMintProcess = useCallback(async (processMintInput) => {
    try {
      // Combined step: Setting up transaction
      updateNotification({ step: 'settingUpTransaction', status: 'inProgress' });

      // User Pre-Authorization
      const preAuthResult = await processMintInput();
      if (preAuthResult.step === 'error') {
        updateNotification(preAuthResult);
        return;
      }

      const chosenId = preAuthResult.selectedId;
      const mintAmount = preAuthResult.selectedQuantity;

      if (chosenId === undefined || mintAmount === undefined) {
        updateNotification({ step: 'error', content: 'Failed to get user chosen ID or mint amount' });
        return;
      }

      // Cross-Chain Balance Check
      const crossChainResult = await checkCrossChainBalance();
      if (!crossChainResult.success) {
        updateNotification({ step: 'error', content: crossChainResult.error });
        return;
      }

      // Random Nonce Generation
      const randomNonce = generateRandomNonce();

      // Prepare data for API communication
      const apiRequestData = {
        otherChainTnftIds: [1, 2, 3, 4],
        otherChainTnftAmounts: crossChainResult.otherChainsTnftMint,
        id: chosenId,
        mintAmount: mintAmount,
        randomNonce: randomNonce,
        Network: network
      };

      // API Communication (Fetching Prices and Generating Signature)
      const apiResponse = await communicateWithApi(apiRequestData);
      if (!apiResponse.success) {
        updateNotification({ step: 'error', content: apiResponse.error });
        return;
      }

      updateNotification({ step: 'settingUpTransaction', status: 'completed' });

      // Inject to Web3 and initiate transaction
      updateNotification({ step: 'waitingConfirmation', status: 'inProgress' });
      let transaction, waitForReceipt;
      try {
        ({ transaction, waitForReceipt } = await injectToWeb3(apiResponse.data));
      } catch (error) {
        if (error.code === 4001 || error.message.includes('user rejected transaction')) {
          console.log('User cancelled the transaction');
          updateNotification({ step: null });
          return;
        }
        throw error;
      }

      console.log('Transaction hash:', transaction.hash);
      updateNotification({ step: 'waitingConfirmation', status: 'completed' });

      // Waiting for transaction receipt
      updateNotification({ step: 'waitingReceipt', status: 'inProgress' });
      const receipt = await waitForReceipt();
      console.log('Transaction receipt:', receipt);
      updateNotification({ step: 'waitingReceipt', status: 'completed' });

      // Success notification
      const nftTypes = ['Bronze', 'Silver', 'Gold', 'Diamond'];
      const nftType = nftTypes[chosenId - 1];
      const truncatedAddress = `${activeAddress.slice(0, 4)}...${activeAddress.slice(-4)}`;
      const message = `${mintAmount} ${nftType} TNO card${mintAmount > 1 ? 's' : ''} successfully MINTED on ${network} by ${truncatedAddress}`;
      updateNotification({ step: 'success', content: message });

    } catch (error) {
      console.error("Error in mint process:", error);
      updateNotification({ step: 'error', content: `Failed to initiate transaction: ${error.message}` });
    }
  }, [checkCrossChainBalance, network, activeAddress, generateRandomNonce, communicateWithApi, injectToWeb3, updateNotification]);

  return {
    executeMintProcess,
  };
};

export default useMintProcess;
