import React, { useRef, useEffect, useState } from 'react';

const ProgressBar = ({ header, maxQty, remaining, unit, maxQtyDescription, afterZeroHeader, loadingHeader }) => {
  const [flash, setFlash] = useState(false);
  const textRef = useRef(null);
  const prevRemainingRef = useRef(remaining);
  
  const isZero = remaining <= 0;
  const isFullSupply = remaining === maxQty;
  
  // Calculate percentages with high precision
  const percentageMinted = isZero ? 100 : ((maxQty - remaining) / maxQty) * 100;
  const percentageRemaining = isZero ? 0 : 100 - percentageMinted;

  useEffect(() => {
    if (remaining !== prevRemainingRef.current) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 1000);
      prevRemainingRef.current = remaining;
      return () => clearTimeout(timer);
    }
  }, [remaining]);

  const adjustedProgress = percentageRemaining;

  // New function to calculate the displayed percentage
  const getDisplayedPercentage = (percentage) => {
    if (percentage === 100) return "100.00";
    if (percentage === 0) return "0.00";
    
    // Round down to ensure we show change as soon as it happens
    return (Math.floor(percentage * 100) / 100).toFixed(2);
  };

  const FlashingText = ({ children }) => (
    <span className={flash ? 'price-changed-text' : ''}>{children}</span>
  );

  return (
    <div className="progress-bar-container">
      <h3 className="progress-bar-header">
        {isZero ? afterZeroHeader : isFullSupply ? loadingHeader : header}
      </h3>
      <div className="progress-bar-wrapper">
        <div className="progress-bar-outer">
          <div 
            className={`progress-bar-inner ${isZero || isFullSupply ? 'zero-remaining' : ''}`}
            style={{ width: `${adjustedProgress}%` }}
          >
            <span ref={textRef} className="progress-bar-text">
              {isZero || isFullSupply
                ? `${maxQty.toLocaleString()} ${unit}`
                : <><FlashingText>{remaining.toLocaleString()}</FlashingText> {unit}</>
              }
            </span>
          </div>
        </div>
        <span className="max-supply-label"> </span>
      </div>
      <div className="progress-bar-info">
        <span className="progress-bar-percentage">
        <FlashingText>~{getDisplayedPercentage(percentageRemaining)}%</FlashingText>
        </span>
        <span className="max-supply-description">{maxQty.toLocaleString()} {unit} {maxQtyDescription}</span>
      </div>
    </div>
  );
};

export default ProgressBar;