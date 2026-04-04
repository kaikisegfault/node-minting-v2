import React, { useRef, useEffect, useState } from 'react';

const MineralsProgressBar = ({ header, maxQty, validated, unit, maxQtyDescription, completedHeader, loadingHeader, isLoading }) => {
  const [flash, setFlash] = useState(false);
  const textRef = useRef(null);
  const prevValidatedRef = useRef(validated);
  
  const isComplete = validated >= maxQty;
  
  // During loading, show full amount, otherwise show validated amount
  const displayAmount = isLoading ? maxQty : validated;
  const percentageValidated = isLoading ? 100 : (validated / maxQty) * 100;

  useEffect(() => {
    if (validated !== prevValidatedRef.current) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 1000);
      prevValidatedRef.current = validated;
      return () => clearTimeout(timer);
    }
  }, [validated]);

  const getDisplayedPercentage = (percentage) => {
    if (percentage === 100) return "100.00";
    if (percentage === 0) return "0.00";
    return (Math.floor(percentage * 100) / 100).toFixed(2);
  };

  const FlashingText = ({ children }) => (
    <span className={flash ? 'price-changed-text' : ''}>{children}</span>
  );

  return (
    <div className="progress-bar-container">
      <h3 className="progress-bar-header">
        {isLoading ? loadingHeader : isComplete ? completedHeader : header}
      </h3>
      <div className="progress-bar-wrapper">
        <div className="progress-bar-outer">
          <div 
            className={`progress-bar-inner ${isLoading ? 'loading' : isComplete ? 'completed' : ''}`}
            style={{ 
              width: `${Math.max(percentageValidated, 2)}%`, // Minimum 2% width to show the number
              minWidth: '40px' // Additional safeguard for number visibility
            }}
          >
            <span ref={textRef} className="progress-bar-text">
              <FlashingText>{displayAmount.toLocaleString()}</FlashingText>
            </span>
          </div>
        </div>
        <span className="max-supply-label"> </span>
      </div>
      <div className="progress-bar-info">
        <span className="progress-bar-percentage">
          <FlashingText>~{getDisplayedPercentage(percentageValidated)}%</FlashingText>
        </span>
        <span className="max-supply-description">{maxQty.toLocaleString()} {unit} {maxQtyDescription}</span>
      </div>
    </div>
  );
};

export default MineralsProgressBar;