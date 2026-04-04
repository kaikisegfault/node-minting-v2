import React, { useState, useCallback } from 'react';
import { Spinner } from 'react-bootstrap';
import { ethers } from 'ethers';
import PopupNotification from '../ui-components/PopupNotification';
import useWalletConnection from '../core/useWalletConnection';
import { useUserReadOnlyState } from '../core/useUserReadOnlyState';
import { useReadOnlyFunctions } from '../core/readOnlyFunctions';
import MINERALS_ABI from '../abis/MINERALS_ABI.json';

const VALIDATION_STEPS = [
  { key: 'waitingConfirmation', label: 'Waiting for user-confirmation' },
  { key: 'waitingReceipt', label: 'Transaction in progress' }
];

const CheckMarkSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#aa00cc"/>
  </svg>
);

const ValidateMinerals = () => {
  const { connected, activeAddress, network } = useWalletConnection();
  const { getMineralsPauseState } = useReadOnlyFunctions();
  const { mineralsAddressInfoResults } = useUserReadOnlyState();
  const [notificationState, setNotificationState] = useState({
    currentStep: null,
    stepStatuses: {},
    content: null,
    validatingQuantity: null
  });

  const updateNotification = useCallback((newState) => {
    setNotificationState(prevState => {
      if (['error', 'success', 'cancelled'].includes(newState.step)) {
        return { 
          currentStep: newState.step,
          content: newState.content,
          stepStatuses: {},
          validatingQuantity: null  // Reset quantity for error/success/cancelled
        };
      }
  
      return {
        ...prevState,
        currentStep: newState.step,
        stepStatuses: {
          ...prevState.stepStatuses,
          [newState.step]: newState.status,
        },
        validatingQuantity: newState.validatingQuantity || prevState.validatingQuantity  // Preserve quantity
      };
    });
  }, []);

  const executeValidation = useCallback(async () => {
    const truncatedAddress = `${activeAddress?.slice(0, 4)}...${activeAddress?.slice(-4)}`;

    if (!connected || !activeAddress || network !== 'Flare') {
      updateNotification({ 
        step: 'error', 
        content: !connected ? 'Please connect your wallet' : 
                 network !== 'Flare' ? 'Please switch to Flare Network' : 
                 'Wallet connection error' 
      });
      return;
    }

    try {
      // Check pause state first
      const isPaused = await getMineralsPauseState();
      if (isPaused) {
        updateNotification({ 
          step: 'error', 
          content: "Validation Opens Soon!" 
        });
        return;
      }

      // Check minerals state
      const { myValidatedMineralsQty, myUnvalidatedMineralsQty } = mineralsAddressInfoResults;
      
      if (myValidatedMineralsQty === 0 && myUnvalidatedMineralsQty === 0) {
        updateNotification({ 
          step: 'error', 
          content: `No Blue Minerals found on that address: ${truncatedAddress}` 
        });
        return;
      }

      if (myUnvalidatedMineralsQty === 0) {
        updateNotification({ 
          step: 'error', 
          content: 'All your Blue Minerals are already validated' 
        });
        return;
      }

      const validatingQty = myUnvalidatedMineralsQty;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.REACT_APP_MINERALS_VALIDATOR_CONTRACT,
        MINERALS_ABI,
        signer
      );

      // First step: Waiting for confirmation
      updateNotification({ 
        step: 'waitingConfirmation', 
        status: 'inProgress',
        validatingQuantity: validatingQty 
      });
      
      let transaction;
      try {
        transaction = await contract.validateAllBlueMinerals();
      } catch (error) {
        if (error.code === 4001 || error.message.includes('user rejected transaction')) {
          console.log('User cancelled the transaction');
          updateNotification({ step: null });
          return;
        }
        throw error;
      }

      updateNotification({ 
        step: 'waitingConfirmation', 
        status: 'completed',
        validatingQuantity: validatingQty 
      });

      updateNotification({ 
        step: 'waitingReceipt', 
        status: 'inProgress',
        validatingQuantity: validatingQty 
      });

      const receipt = await transaction.wait();
      console.log('Transaction receipt:', receipt);

      updateNotification({ 
        step: 'waitingReceipt', 
        status: 'completed',
        validatingQuantity: validatingQty 
      });

      // Success notification with proper grammar
      const message = validatingQty === 1
        ? `1 Blue Mineral has been successfully validated by ${truncatedAddress}!`
        : `${validatingQty} Blue Minerals have been successfully validated by ${truncatedAddress}!`;
      
      updateNotification({ step: 'success', content: message });

    } catch (error) {
      console.error("Error in validation process:", error);
      updateNotification({ 
        step: 'error', 
        content: `Failed to validate minerals: ${error.message}` 
      });
    }
  }, [connected, activeAddress, network, updateNotification, mineralsAddressInfoResults, getMineralsPauseState]);

  const renderNotification = useCallback(() => {
    if (!notificationState.currentStep) return null;
  
    if (['error', 'success', 'cancelled'].includes(notificationState.currentStep)) {
      return (
        <PopupNotification
          message={notificationState.content}
          onClose={() => setNotificationState({ 
            currentStep: null, 
            stepStatuses: {}, 
            content: null,
            validatingQuantity: null 
          })}
        />
      );
    }
  
    const content = (
      <div className="minting-steps-container">
        <h3>Validating {notificationState.validatingQuantity} Blue {
          notificationState.validatingQuantity === 1 ? 'Mineral' : 'Minerals'
        }</h3>
        {VALIDATION_STEPS.map((step, index) => {
          const isCompleted = notificationState.stepStatuses[step.key] === 'completed';
          const isInProgress = step.key === notificationState.currentStep && 
                             notificationState.stepStatuses[step.key] === 'inProgress';
          const shouldShow = index === 0 || 
                           notificationState.stepStatuses[VALIDATION_STEPS[index - 1].key] === 'completed';

          return (
            <div 
              key={step.key} 
              className={`minting-step ${shouldShow ? 'show' : ''}`}
            >
              <span className="step-label">{step.label}</span>
              {isInProgress && <Spinner animation="grow" variant="secondary" size="sm" />}
              {isCompleted && <CheckMarkSVG />}
            </div>
          );
        })}
      </div>
    );
  
    return (
      <PopupNotification
        message={content}
        onClose={() => setNotificationState({ 
          currentStep: null, 
          stepStatuses: {}, 
          content: null,
          validatingQuantity: null 
        })}
      />
    );
  }, [notificationState]);

  return (
    <>
      <button className="btn-regular mint" onClick={executeValidation}>
        Validate
      </button>
      {renderNotification()}
    </>
  );
};

export default ValidateMinerals;