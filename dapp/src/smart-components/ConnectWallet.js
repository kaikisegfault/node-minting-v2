import React, { useState, useCallback } from 'react';
import useWalletConnection from '../core/useWalletConnection';
import PopupNotification from '../ui-components/PopupNotification';
import MetaMaskLogo from '../SVG_MetaMask_Icon_Color.svg';
import BifrostLogo from '../Bifrost_logo.jpg';

function ConnectWallet() {
  const {
    connected,
    connect,
    checkConnecting,
    checkNetworkSwitchPending
  } = useWalletConnection();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const handleConnect = useCallback(async () => {
    if (checkConnecting() || checkNetworkSwitchPending()) {
      setNotificationMessage("check the wallet and complete the pending request");
      setShowNotification(true);
      return;
    }

    if (!window.ethereum && !window.web3) {
      setNotificationMessage(
        <div>
          <img className='metamask-logo' src={MetaMaskLogo} alt="MetaMask Logo" style={{ width: '54px',  marginBottom: '10px' }} />
          <h2 className='metamask'>Get MetaMask</h2>
          <div className='connect-item-wrapper'>
            <div className='connect-item'>
              <button className='btn-regular info' onClick={() => window.open("https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202", "_blank")}>
                iOS App <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#B197FC" d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l82.7 0L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3l0 82.7c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160c0-17.7-14.3-32-32-32L320 0zM80 32C35.8 32 0 67.8 0 112L0 432c0 44.2 35.8 80 80 80l320 0c44.2 0 80-35.8 80-80l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16L80 448c-8.8 0-16-7.2-16-16l0-320c0-8.8 7.2-16 16-16l112 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32z" /></svg>
              </button>
            </div>
            <div className='connect-item'>
              <button className='btn-regular info' onClick={() => window.open("https://play.google.com/store/apps/details?id=io.metamask&hl=en&pli=1", "_blank")}>
                Android App <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#B197FC" d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l82.7 0L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3l0 82.7c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160c0-17.7-14.3-32-32-32L320 0zM80 32C35.8 32 0 67.8 0 112L0 432c0 44.2 35.8 80 80 80l320 0c44.2 0 80-35.8 80-80l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16L80 448c-8.8 0-16-7.2-16-16l0-320c0-8.8 7.2-16 16-16l112 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32z" /></svg>
              </button>
            </div>
            <div className='connect-item'>
              <button className='btn-regular info' onClick={() => window.open("https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn", "_blank")}>
                Chrome Extension <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#B197FC" d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l82.7 0L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3l0 82.7c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160c0-17.7-14.3-32-32-32L320 0zM80 32C35.8 32 0 67.8 0 112L0 432c0 44.2 35.8 80 80 80l320 0c44.2 0 80-35.8 80-80l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16L80 448c-8.8 0-16-7.2-16-16l0-320c0-8.8 7.2-16 16-16l112 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32z" /></svg>
              </button>
            </div>
          </div>

          <img className='metamask-logo' src={BifrostLogo} alt="Bifrost Logo" style={{ width: '48px',  marginBottom: '10px', marginTop: '20px' }} />
          <h2 className='metamask'>Get Bifrost</h2>
          <div className='connect-item-wrapper'>
            <div className='connect-item'>
              <button className='btn-regular info' onClick={() => window.open("https://apps.apple.com/gb/app/bifrost-wallet/id1577198351", "_blank")}>
                iOS App <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#B197FC" d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l82.7 0L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3l0 82.7c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160c0-17.7-14.3-32-32-32L320 0zM80 32C35.8 32 0 67.8 0 112L0 432c0 44.2 35.8 80 80 80l320 0c44.2 0 80-35.8 80-80l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16L80 448c-8.8 0-16-7.2-16-16l0-320c0-8.8 7.2-16 16-16l112 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32z" /></svg>
              </button>
            </div>
            <div className='connect-item'>
              <button className='btn-regular info' onClick={() => window.open("https://play.google.com/store/apps/details?id=com.bifrostwallet.app&hl=en_GB&gl=US", "_blank")}>
                Android App <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#B197FC" d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l82.7 0L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3l0 82.7c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160c0-17.7-14.3-32-32-32L320 0zM80 32C35.8 32 0 67.8 0 112L0 432c0 44.2 35.8 80 80 80l320 0c44.2 0 80-35.8 80-80l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16L80 448c-8.8 0-16-7.2-16-16l0-320c0-8.8 7.2-16 16-16l112 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32z" /></svg>
              </button>
            </div>
          </div>

          <p className='connect-l-p' style={{ marginTop: '20px' }}>
            or use any other web3 wallet provider
          </p>
        </div>
      );
      setShowNotification(true);
      return;
    }

    try {
      const result = await connect();
      if (result.cancelled) {
        setShowNotification(false);
      } else if (!result.success) {
        setNotificationMessage("check the wallet and complete the pending request");
        setShowNotification(true);
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      setNotificationMessage("check the wallet and complete the pending request");
      setShowNotification(true);
    }
  }, [connect, checkConnecting, checkNetworkSwitchPending]);

  const closeNotification = () => {
    setShowNotification(false);
  };

  if (connected) return null;

  return (
    <div>
      <button onClick={handleConnect} className="btn-regular">
        Connect Wallet
      </button>
      {showNotification && (
        <PopupNotification
          message={notificationMessage}
          onClose={closeNotification}
        />
      )}
    </div>
  );
}

export default ConnectWallet;