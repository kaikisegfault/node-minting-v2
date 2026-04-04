import React, { useState, useEffect } from 'react';
import useWalletConnection from '../core/useWalletConnection';
import usePrices from '../core/usePrices';

const createPriceInfo = (location) => {
  return function PriceInfoComponent() {
    const { network, connected } = useWalletConnection();
    const prices = usePrices();
    const [flash, setFlash] = useState(false);

    const isEthereumOrFlare = network === 'Ethereum' || network === 'Flare';
    const showBothPrices = !connected || !isEthereumOrFlare;

    useEffect(() => {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 1000);
      return () => clearTimeout(timer);
    }, [prices.lastUpdateTimestamp]);

    const getPrice = (currency) => {
      if (currency === 'ETH') {
        return location === 'Location1' ? prices.bronzePriceETH :
          location === 'Location2' ? prices.silverPriceETH :
            location === 'Location3' ? prices.goldPriceETH :
              prices.diamondPriceETH;
      } else {
        return location === 'Location1' ? prices.bronzePriceFLR :
          location === 'Location2' ? prices.silverPriceFLR :
            location === 'Location3' ? prices.goldPriceFLR :
              prices.diamondPriceFLR;
      }
    };

    const fixedExplPrices = {
      Location1: "1 $EXPL = $0.008",
      Location2: "1 $EXPL = $0.0072",
      Location3: "1 $EXPL = $0.00576",
      Location4: "1 $EXPL = $0.00403"
    };

    const FlashingText = ({ children }) => (
      <span className={flash ? 'price-changed-text' : ''}>{children}</span>
    );

    return (
      <div className="price-info-box">
        <div className="price-info-section">
          <div className='price-p'>
            <h3>Price</h3>
            {showBothPrices ? (
              <>
                <p><FlashingText>{getPrice('ETH').toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</FlashingText> ETH</p>
                <p><FlashingText>{getPrice('FLR').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</FlashingText> FLR</p>
              </>
            ) : (
              <p>
                <FlashingText>
                  {network === 'Ethereum'
                    ? getPrice('ETH').toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })
                    : getPrice('FLR').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  }
                </FlashingText> {network === 'Ethereum' ? 'ETH' : 'FLR'}
              </p>
            )}
          </div>


          <div className="price-info-section">
            {showBothPrices ? (
              <>
                <p>ETH/USD: <FlashingText>${prices.ethUsd.toFixed(2)}</FlashingText></p>
                <p>FLR/USD: <FlashingText>${prices.flrUsd.toFixed(5)}</FlashingText></p>
              </>
            ) : (
              <p>{network === 'Ethereum' ? 'ETH/USD: ' : 'FLR/USD: '}
                <FlashingText>${network === 'Ethereum' ? prices.ethUsd.toFixed(2) : prices.flrUsd.toFixed(5)}</FlashingText>
              </p>
            )}
          </div>
        </div>

        <div className='price-bottom'>
          <p className="price-info-fixed-price">{fixedExplPrices[location]}</p>
        </div>
      </div>
    );
  };
};

const PriceInfo1 = createPriceInfo('Location1');
const PriceInfo2 = createPriceInfo('Location2');
const PriceInfo3 = createPriceInfo('Location3');
const PriceInfo4 = createPriceInfo('Location4');

const PriceInfo = ({ id }) => {
  if (id === 'Location1') return <PriceInfo1 />;
  if (id === 'Location2') return <PriceInfo2 />;
  if (id === 'Location3') return <PriceInfo3 />;
  if (id === 'Location4') return <PriceInfo4 />;
};

export default PriceInfo;