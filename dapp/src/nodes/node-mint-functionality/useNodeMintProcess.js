// useNodeMintProcess.js

import { useCallback } from 'react';
import useWalletConnection from '../../core/useWalletConnection';
import useNodeWeb3Injection from './useNodeWeb3Injection';
import useNodeRegMintProcess from './reg-mint/useNodeRegMintProcess'; // Import at top level

const useNodeMintProcess = (updateNotification) => {
  const { network, activeAddress } = useWalletConnection();
  const { injectWhitelistMint } = useNodeWeb3Injection();
  const { executeRegularMint } = useNodeRegMintProcess(updateNotification); // Use hook at top level

  const executeWhitelistMint = useCallback(async (eligibleQuantity) => {
        try {
        const quantity = parseInt(eligibleQuantity.toString());
        
        updateNotification({ 
            step: 'whitelistMint', 
            currentStep: 'waitingConfirmation',
            stepStatuses: { waitingConfirmation: 'inProgress' },
            eligibleQuantity: quantity
        });
    
        const { waitForReceipt } = await injectWhitelistMint();
        
        updateNotification({
            step: 'whitelistMint',
            currentStep: 'waitingReceipt',
            stepStatuses: { 
            waitingConfirmation: 'completed',
            waitingReceipt: 'inProgress'
            },
            eligibleQuantity: quantity
        });
    
        const receipt = await waitForReceipt();
        console.log('Transaction receipt:', receipt);
    
        updateNotification({
            step: 'whitelistMint',
            currentStep: 'completed',
            stepStatuses: {
            waitingConfirmation: 'completed',
            waitingReceipt: 'completed'
            },
            eligibleQuantity: quantity
        });
    
        const truncatedAddress = `${activeAddress.slice(0, 4)}...${activeAddress.slice(-4)}`;
        const nodeText = quantity > 1 ? 'Nodes' : 'Node';
        const message = `${quantity} whitelisted ${nodeText} successfully MINTED on ${network} by ${truncatedAddress}`;
        updateNotification({ step: 'success', content: message });
    
        } catch (error) {
        if (error.code === 4001 || error.message.includes('user rejected transaction')) {
            updateNotification({ step: null });
            return;
        }
        throw error;
        }
  }, [network, activeAddress, injectWhitelistMint, updateNotification]);

  const executeMintProcess = useCallback(async (processMintInput) => {
    try {
      const result = await processMintInput();
      
      if (result.step === 'error' || result.step === 'notification') {
        updateNotification(result);
        return;
      }

      if (result.step === 'whitelistMint') {
        await executeWhitelistMint(result.eligibleQuantity);
        return;
      }

      if (result.step === 'userPreAuthorization') {
        try {
          await executeRegularMint({
            quantity: result.selectedQuantity,
            address: activeAddress,
            network: network
          });
        } catch (error) {
          updateNotification({ 
            step: 'error', 
            content: <div className="problem-popup">{`Error: ${error.message}`}</div> 
          });
        }
        return;
      }
    } catch (error) {
      updateNotification({ 
        step: 'error', 
        content: <div className="problem-popup">{`Error: ${error.message}`}</div> 
      });
    }
  }, [executeWhitelistMint, executeRegularMint, updateNotification, activeAddress, network]);

  return {
    executeMintProcess
  };
};

export default useNodeMintProcess;