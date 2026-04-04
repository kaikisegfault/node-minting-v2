import React, { useState, useCallback } from 'react';
import { Spinner } from 'react-bootstrap';
import PopupNotification from '../../ui-components/PopupNotification';

const MINTING_STEPS = [
  { key: 'settingUpTransaction', label: 'Setting up transaction' },
  { key: 'waitingConfirmation', label: 'Waiting for user-confirmation' },
  { key: 'waitingReceipt', label: 'Transaction in progress' },
];

const CheckMarkSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#aa00cc"/>
  </svg>
);

const useMintNotifications = () => {
  const [notificationState, setNotificationState] = useState({
    currentStep: null,
    stepStatuses: {},
    content: null,
  });

  const updateNotification = useCallback((newState) => {
    setNotificationState(prevState => {
      if (['error', 'success', 'cancelled'].includes(newState.step)) {
        return { 
          currentStep: newState.step,
          content: newState.content,
          stepStatuses: {},
        };
      }
  
      return {
        ...prevState,
        currentStep: newState.step,
        stepStatuses: {
          ...prevState.stepStatuses,
          [newState.step]: newState.status,
        },
      };
    });
  }, []);

  const renderNotification = useCallback(() => {
    if (!notificationState.currentStep) return null;
  
    if (['error', 'success', 'cancelled'].includes(notificationState.currentStep)) {
      return (
        <PopupNotification
          message={notificationState.content}
          onClose={() => setNotificationState({ currentStep: null, stepStatuses: {}, content: null })}
        />
      );
    }
  
    const content = (
      <div className="minting-steps-container">
        <h3>MINTING</h3>
        {MINTING_STEPS.map((step, index) => {
          const isCompleted = notificationState.stepStatuses[step.key] === 'completed';
          const isInProgress = step.key === notificationState.currentStep && notificationState.stepStatuses[step.key] === 'inProgress';
          const shouldShow = index === 0 || notificationState.stepStatuses[MINTING_STEPS[index - 1].key] === 'completed';

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
        onClose={() => setNotificationState({ currentStep: null, stepStatuses: {}, content: null })}
      />
    );
  }, [notificationState]);

  return {
    updateNotification,
    renderNotification,
  };
};

export default useMintNotifications;