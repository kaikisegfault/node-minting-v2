// useNodeMintNotifications.js
import React, { useState, useCallback } from 'react';
import { Spinner } from 'react-bootstrap';
import PopupNotification from '../../ui-components/PopupNotification';

const MINTING_STEPS = [
  { key: 'waitingConfirmation', label: 'Waiting for user-confirmation' },
  { key: 'waitingReceipt', label: 'Transaction in progress' },
];

const CheckMarkSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#aa00cc"/>
  </svg>
);

const useNodeMintNotifications = () => {
  const [notificationState, setNotificationState] = useState({
    currentStep: null,
    stepStatuses: {},
    content: null,
  });

  const updateNotification = useCallback((newState) => {
    setNotificationState(prevState => {
      // Handle null state (for closing notification)
      if (newState.step === null) {
        return {
          currentStep: null,
          stepStatuses: {},
          content: null,
        };
      }

      // Handle notification, error, and success states
      if (['error', 'success', 'notification'].includes(newState.step)) {
        return { 
          currentStep: newState.step,
          content: newState.content,
          stepStatuses: {},
        };
      }

      // Handle whitelist minting steps
      if (newState.step === 'whitelistMint') {
        const content = (
          <div className="minting-steps-container">
            <h3>MINTING {newState.eligibleQuantity} {newState.eligibleQuantity > 1 ? 'Nodes' : 'Node'}</h3>
            {MINTING_STEPS.map((step, index) => {
              const isCompleted = newState.stepStatuses[step.key] === 'completed';
              const isInProgress = step.key === newState.currentStep && newState.stepStatuses[step.key] === 'inProgress';
              const shouldShow = index === 0 || newState.stepStatuses[MINTING_STEPS[index - 1].key] === 'completed';

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

        return {
          currentStep: newState.step,
          stepStatuses: newState.stepStatuses || prevState.stepStatuses,
          content
        };
      }

      return prevState;
    });
  }, []);

  const renderNotification = useCallback(() => {
    if (!notificationState.currentStep) return null;
  
    return (
      <PopupNotification
        message={notificationState.content}
        onClose={() => setNotificationState({ currentStep: null, stepStatuses: {}, content: null })}
      />
    );
  }, [notificationState]);

  return {
    updateNotification,
    renderNotification,
  };
};

export default useNodeMintNotifications;