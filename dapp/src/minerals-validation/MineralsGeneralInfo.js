import React, { useState } from 'react';
import PopupNotification from '../ui-components/PopupNotification';

const MineralsGeneralInfo = () => {
  const [showPopup, setShowPopup] = useState(false);

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const popupMessage = (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <p style={{ textAlign: 'left', color: '#555', fontSize: '14px', marginBottom: '20px' }}>
          In the <a href="https://world.expl.one" target="_blank" rel="noopener noreferrer">ONE world</a> only 
          validated Blue Minerals will be eligible for participation in all activities, such as airdrops, 
          rewards distributions, and other in-platform transactions. The old Minerals will no longer have any use case, 
          ensuring that only updated, verified assets are utilized within the new ecosystem.
        </p>
        
        <h4 className='c-h' style={{ textAlign: 'left', marginBottom: '5px' }}>contract address</h4>
        <p className='c-addr' style={{ textAlign: 'left', marginTop: '0', marginBottom: '10px', wordWrap: 'break-word', maxWidth: '100%' }}>
          0x0E3a65c21059361eBca4Ce5aCFFb21615d1f12F1
        </p>
        <p className='f-a' style={{ textAlign: 'left', marginTop: '0' }}>
          find at
          <br />
          <a href="https://flarescan.com/address/0x0E3a65c21059361eBca4Ce5aCFFb21615d1f12F1/contract/14/code?chainid=14" target="_blank" rel="noopener noreferrer">
            Flarescan.com
          </a>
          <br />
          <a href="https://flare-explorer.flare.network/address/0x0E3a65c21059361eBca4Ce5aCFFb21615d1f12F1?tab=contract_code" target="_blank" rel="noopener noreferrer">
            Flare-explorer
          </a>
          <br />
          <a href="https://github.com/explorills/nft-validator" target="_blank" rel="noopener noreferrer">
            Github/ONE/nft-validator
          </a>
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

export default MineralsGeneralInfo;