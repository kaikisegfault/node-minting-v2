import React, { useState } from 'react';
import PopupNotification from '../ui-components/PopupNotification';
import Grid from '../ui-components/Grid';
import { useMainReadOnly } from '../core/useReadOnlyState';

const GeneralInfo = () => {
  const [showPopup, setShowPopup] = useState(false);
  const {
  EthAbCurrentChainTnftSupplyResults,
    FlareAbCurrentChainTnftSupplyResults
  } = useMainReadOnly();

  const handleButtonClick = () => {
    // document.getElementById('fp-nav').style.zIndex = -1;
    setShowPopup(true);
  };

  const closePopup = () => {
    // document.getElementById('fp-nav').style.zIndex = 9;
    setShowPopup(false);
  };

  const calculateTotal = (type) => {
    return (
      EthAbCurrentChainTnftSupplyResults[type] +
      FlareAbCurrentChainTnftSupplyResults[type]
    );
  };

  const popupMessage = (
    <>
      <Grid
        header="TNO cards minted"
        rows={[
          ["Network", "Bronze", "Silver", "Gold", "Diamond"],
          ["Ethereum", EthAbCurrentChainTnftSupplyResults.bronze, EthAbCurrentChainTnftSupplyResults.silver, EthAbCurrentChainTnftSupplyResults.gold, EthAbCurrentChainTnftSupplyResults.diamond],
          ["Flare", FlareAbCurrentChainTnftSupplyResults.bronze, FlareAbCurrentChainTnftSupplyResults.silver, FlareAbCurrentChainTnftSupplyResults.gold, FlareAbCurrentChainTnftSupplyResults.diamond],
          ["TOTAL", calculateTotal("bronze"), calculateTotal("silver"), calculateTotal("gold"), calculateTotal("diamond")]
        ]}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '20px' }}>
        <h4 className='c-h' style={{ textAlign: 'left', marginBottom: '5px' }}>contract address</h4>
        <p className='c-addr' style={{ textAlign: 'left', marginTop: '0', marginBottom: '10px', wordWrap: 'break-word', maxWidth: '100%' }}>0xa255Ea1Ce9D42Ff1AE8D573D1765C49335631059</p>
        <p className='f-a' style={{ textAlign: 'left', marginTop: '0' }}>
          find at
          <br />
            <a href="https://sourcify.dev/#/lookup/0xa255Ea1Ce9D42Ff1AE8D573D1765C49335631059" target="_blank" rel="noopener noreferrer">
            sourcify.eth
            </a>
            <br />

            <a href="https://etherscan.io/address/0xa255Ea1Ce9D42Ff1AE8D573D1765C49335631059#code" target="_blank" rel="noopener noreferrer">
            Etherscan.io
            </a>

            <br /> 
            <a href="https://flarescan.com/address/0xa255Ea1Ce9D42Ff1AE8D573D1765C49335631059/contract/14/code?chainid=14" target="_blank" rel="noopener noreferrer">
            Flarescan.com
            </a>
            <br />
            <a href="https://flare-explorer.flare.network/address/0xa255Ea1Ce9D42Ff1AE8D573D1765C49335631059/contracts#address-tabs" target="_blank" rel="noopener noreferrer">
            Flare-explorer
            </a>
            <br /> 
            <a href="https://github.com/explorills/tno-contract" target="_blank" rel="noopener noreferrer">
            Github/ONE/tno-contract
            </a>
            <br />

            
        </p>
      </div>

    </>
  );

  return (
    <div>
      <button className="btn-regular info" onClick={handleButtonClick}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" /></svg>
        General Info
      </button>
      {showPopup && (
        <PopupNotification
          message={popupMessage}
          onClose={closePopup}
        />
      )}
    </div>
  );
};

export default GeneralInfo;