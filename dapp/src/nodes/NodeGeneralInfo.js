import React, { useState } from 'react';
import PopupNotification from '../ui-components/PopupNotification';

const NodeGeneralInfo = () => {
  const [showPopup, setShowPopup] = useState(false);

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const popupMessage = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <p style={{ textAlign: 'left', color: '#555', fontSize: '14px', marginBottom: '20px' }}>
          <strong>NOTE:</strong> Nodes are being minted in the Nodes Escrow under the ownership of minter address. The Escrow will be released automatically after 
          10,800 Nodes are minted. Even during the minting phase and before the Escrow release, at Nodes Operating Dashboard  
          at <a href="https://network.expl.one" target="_blank" rel="noopener noreferrer">network.expl.one</a>, You can manage your Nodes directly from the Escrow and earn daily $EXPL rewards.
        </p>
      
      <div className='f-a' style={{ textAlign: 'left', marginTop: '0' }}>
        find at <a href="https://github.com/explorills" target="_blank" rel="noopener noreferrer">Github/ONE</a>
        <br />
        <a href="https://github.com/explorills/nodes" target="_blank" rel="noopener noreferrer">/nodes</a>
        <p className='c-addr' style={{ textAlign: 'left', marginTop: '0', marginBottom: '10px', wordWrap: 'break-word', maxWidth: '100%' }}>
          0x468F1F91fc674e0161533363B13c2ccBE3769981
        </p>

        <a href="https://github.com/explorills/node-escrow" target="_blank" rel="noopener noreferrer">/node-escrow</a>
        <p className='c-addr' style={{ textAlign: 'left', marginTop: '0', marginBottom: '10px', wordWrap: 'break-word', maxWidth: '100%' }}>
          0x9eAEc5DB08E0D243d07A82b8DD54Cc70E745f8b4
        </p>

        <a href="https://github.com/explorills/node-bridge-escrow" target="_blank" rel="noopener noreferrer">/node-bridge-escrow</a>
        <p className='c-addr' style={{ textAlign: 'left', marginTop: '0', marginBottom: '10px', wordWrap: 'break-word', maxWidth: '100%' }}>
          0x129D9dce2326492d073D147762230e60c01e0f97
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <button className="btn-regular info" onClick={handleButtonClick}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7-24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" /></svg>
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

export default NodeGeneralInfo;