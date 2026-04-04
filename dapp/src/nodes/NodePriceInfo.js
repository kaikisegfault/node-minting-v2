import React, { useState, useEffect } from 'react';
import useWalletConnection from '../core/useWalletConnection';
import useNodePrices from './useNodePrices';
import { Spinner } from 'react-bootstrap';

const NodePriceInfo = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { network, connected } = useWalletConnection();
  const prices = useNodePrices();
  const [flash, setFlash] = useState(false);

  const isEthereumOrFlare = network === 'Ethereum' || network === 'Flare' || network === 'Binance';
  const showBothPrices = !connected || !isEthereumOrFlare;

  // Handle flashing effect on price updates
  useEffect(() => {
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 1000);
    return () => clearTimeout(timer);
  }, [prices.lastUpdateTimestamp]);
  
  useEffect(() => {
    // One simple check that ensures complete data
    if (prices.nextTierPriceUSD >= 7) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 250);
      
      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [prices.nextTierPriceUSD]);
  
  // Add a loading delay to ensure consistent UI rendering
  useEffect(() => {
    // Check if key price data is available
    const pricesLoaded = prices.currentNodePriceETH > 0 && 
                        prices.currentNodePriceFLR > 0 && 
                        prices.EthUsdConversion > 0 && 
                        prices.FlrUsdConversion > 0;
    
    if (pricesLoaded) {
      // Add a small delay to ensure smooth UI transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 250);
      
      return () => clearTimeout(timer);
    }
  }, [prices]);

  const getPrice = (currency) => {
    return currency === 'ETH' ? prices.currentNodePriceETH : prices.currentNodePriceFLR;
  };

  const FlashingText = ({ children }) => (
    <span className={flash ? 'price-changed-text' : ''}>{children}</span>
  );

  if (isLoading) {
  return (
    <div className="price-info-box">
      <div className="price-info-section">
        <div className='price-p'>
        <h3>Price <Spinner animation="grow" variant="secondary" size="sm" /> </h3>
          {showBothPrices ? (
            <>
              <p> 0.000000 ETH</p>
              <p> 00.00 FLR</p>
            </>
          ) : (
            <p>
              <FlashingText>
                {network === 'Ethereum'
                  ? getPrice('ETH').toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })
                  : getPrice('FLR').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                }
              </FlashingText> {network === 'Ethereum' ? 'ETH' : 'FLR'}
            </p>
          )}
        </div>

        <div className="price-info-section">
          {showBothPrices ? (
            <>
              <p>ETH/USD: $0000.00 </p>
              <p>FLR/USD: $0.00000</p>
            </>
          ) : (
            <p>{network === 'Ethereum' ? 'ETH/USD: ' : 'FLR/USD: '}
              <FlashingText>${network === 'Ethereum' ? prices.EthUsdConversion.toFixed(2) : prices.FlrUsdConversion.toFixed(5)}</FlashingText>
            </p>
          )}
        </div>
      </div>

      <div className='price-bottom'>
        <p className="price-info-fixed-price">Next Tier = 0 USD</p>
      </div>
    </div>
    );
  }
  
  return (
    <div className="price-info-box">
      <div className="price-info-section">
        <div className='price-p'>
          <h3>Price</h3>
          {showBothPrices ? (
            <>
              <p><FlashingText>{getPrice('ETH').toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}</FlashingText> ETH</p>
              <p><FlashingText>{getPrice('FLR').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</FlashingText> FLR</p>
            </>
          ) : (
            <p>
              <FlashingText>
                {network === 'Ethereum'
                  ? getPrice('ETH').toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })
                  : getPrice('FLR').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                }
              </FlashingText> {network === 'Ethereum' ? 'ETH' : 'FLR'}
            </p>
          )}
        </div>

        <div className="price-info-section">
          {showBothPrices ? (
            <>
              <p>ETH/USD: <FlashingText>${prices.EthUsdConversion.toFixed(2)}</FlashingText></p>
              <p>FLR/USD: <FlashingText>${prices.FlrUsdConversion.toFixed(5)}</FlashingText></p>
            </>
          ) : (
            <p>{network === 'Ethereum' ? 'ETH/USD: ' : 'FLR/USD: '}
              <FlashingText>${network === 'Ethereum' ? prices.EthUsdConversion.toFixed(2) : prices.FlrUsdConversion.toFixed(5)}</FlashingText>
            </p>
          )}
        </div>
      </div>

      <div className='price-bottom'>
        <p className="price-info-fixed-price">Next Tier = {prices.nextTierPriceUSD} USD</p>
      </div>
    </div>
  );
};

export default NodePriceInfo;