// NodeProgressBar.js
import React, { useRef, useEffect, useState } from 'react';

const NodeProgressBar = ({ 
  header, 
  maxQty, 
  remaining, 
  unit, 
  maxQtyDescription, 
  afterZeroHeader, 
  loadingHeader, 
  totalRemaining, 
  totalMinted,
  regularMinted,
  whitelistMinted,
  isLoadingTotal
}) => {
  const [flash, setFlash] = useState(false);
  const textRef = useRef(null);
  const prevRemainingRef = useRef(remaining);
  
  const isZero = remaining <= 0;
  const isLoading = remaining === undefined || remaining === null;
  
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

  const FlashingText = ({ children }) => (
    <span className={flash ? 'price-changed-text' : ''}>{children}</span>
  );

  return (
    <div className="progress-bar-container">
      <h3 className="progress-bar-header">
        <FlashingText>
          {isLoading ? loadingHeader : isZero ? afterZeroHeader : header}
        </FlashingText>
      </h3>
      <div className="progress-bar-wrapper">
        <div className="progress-bar-outer">
          <div 
            className={`progress-bar-inner ${isZero ? 'zero-remaining' : ''}`}
            style={{ width: `${adjustedProgress}%` }}
          >
            <span ref={textRef} className="progress-bar-text">
              {isLoading
                ? "12,000"
                : isZero 
                  ? `${maxQty.toLocaleString()} ${unit}`
                  : <><FlashingText>{remaining.toLocaleString()}</FlashingText> {unit}</>
              }
            </span>
          </div>
        </div>
        <span className="max-supply-label"> </span>
      </div>
      <div className="progress-bar-info">
        <div className="progress-bar-stats-column">
          {!isLoading && (
            <>
              <div className="progress-bar-percentage">
                {isLoadingTotal 
                  ? <span>WHITELIST MINTED:</span>
                  : <FlashingText>WHITELIST MINTED: {whitelistMinted.toLocaleString()}</FlashingText>
                }
              </div>
              <div className="progress-bar-percentage">
                {isLoadingTotal 
                  ? <span>REGULAR MINTED:</span>
                  : <FlashingText>REGULAR MINTED: {regularMinted.toLocaleString()}</FlashingText>
                }
              </div>
            </>
          )}
        </div>
        <div className="max-supply-description">
          <div>{maxQtyDescription} {12000..toLocaleString()}</div>
          {!isLoading && (
            <div>
              {isLoadingTotal 
                ? <span>TOTAL MINTED:</span> 
                : <FlashingText>TOTAL MINTED: {totalMinted.toLocaleString()}</FlashingText>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeProgressBar;