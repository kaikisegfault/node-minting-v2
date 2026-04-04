// src/components/PriceTest.js
import React, { useState } from 'react';
import PopupNotification from '../ui-components/PopupNotification';
import usePrices from '../core/usePrices';

const PriceTest = () => {
  const [showPopup, setShowPopup] = useState(false);
  const prices = usePrices(); // Use the current prices with automatic updates

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const {
    bronzePriceETH,
    silverPriceETH,
    goldPriceETH,
    diamondPriceETH,
    bronzePriceFLR,
    silverPriceFLR,
    goldPriceFLR,
    diamondPriceFLR,
    ethUsd,
    flrUsd,
  } = prices;

  const popupMessage = (
    <div style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>
      <h3 style={{ marginBottom: '10px' }}>Prices</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Currency</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Bronze</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Silver</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Gold</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Diamond</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>ETH</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{bronzePriceETH.toFixed(6)}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{silverPriceETH.toFixed(6)}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{goldPriceETH.toFixed(6)}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{diamondPriceETH.toFixed(6)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>FLR</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{bronzePriceFLR.toFixed(2)}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{silverPriceFLR.toFixed(2)}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{goldPriceFLR.toFixed(2)}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{diamondPriceFLR.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <p style={{ marginTop: '10px' }}>Conversion Rates:</p>
      <p>ETH/USD: ${ethUsd.toFixed(2)}</p>
      <p>FLR/USD: ${flrUsd.toFixed(5)}</p>
    </div>
  );

  return (
    <div>
      <button onClick={handleButtonClick}>
        Price Test
      </button>
      {showPopup && (
        <PopupNotification 
          message={popupMessage}
          onClose={closePopup}
        />)
      }
    </div>
  );
};

export default PriceTest;
