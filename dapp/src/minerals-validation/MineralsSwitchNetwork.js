import React, { useState, useEffect } from 'react';
import Selector from '../ui-components/Selector';
import useWalletConnection from '../core/useWalletConnection';
import PopupNotification from '../ui-components/PopupNotification';

const MineralsSwitchNetwork = () => {
    const { network, switchNetwork, checkNetworkSwitchPending, addFlareNetwork } = useWalletConnection();
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    useEffect(() => {
      if (!checkNetworkSwitchPending()) {
        setShowNotification(false);
      }
    }, [checkNetworkSwitchPending]);

    const handleNetworkChange = async (selectedNetwork) => {
      // Only allow switching to Flare network
      if (selectedNetwork === 'Ethereum') {
        return;
      }

      if (checkNetworkSwitchPending()) {
        setNotificationMessage("check the wallet and complete the pending request");
        setShowNotification(true);
        return;
      }
      try {
        if (selectedNetwork === 'Flare') {
          await addFlareNetwork();
        }
        await switchNetwork(selectedNetwork);
      } catch (error) {
        console.error('Failed to switch network:', error);
        if (error.code === -32002 || error.message === "Network switch already pending") {
          alert("check the wallet and complete the pending request");
        } else {
          setNotificationMessage("check the wallet and complete the pending request");
          setShowNotification(true);
        }
      }
    };

    const closeNotification = () => {
      setShowNotification(false);
    };

    const getTitle = () => {
      return network === 'Flare' ? "Chosen Network" : "Choose Flare to Validate";
    };

    return (
      <div>
        <Selector
          title={getTitle()}
          options={['Ethereum', 'Flare']} // Added Ethereum back to maintain UI shape
          onChange={handleNetworkChange}
          selectedOption={network}
          disabledOptions={['Ethereum']} // Always disable Ethereum
          defaultSelected="none"
          disabled={checkNetworkSwitchPending()}
        />
        {showNotification && (
          <PopupNotification 
            message={notificationMessage} 
            onClose={closeNotification} 
          />
        )}
      </div>
    );
};

export default MineralsSwitchNetwork;