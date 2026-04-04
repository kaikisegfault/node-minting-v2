import React, { useState, useEffect } from 'react';
import Selector from '../ui-components/Selector';
import useWalletConnection from '../core/useWalletConnection';
import PopupNotification from '../ui-components/PopupNotification';
import { isLocalMode, simulatedChainEmitter } from '../core/HardhatInteraction';

const createSwitchNetwork = (versionId) => {
  return () => {
    const { network, switchNetwork, checkNetworkSwitchPending, addFlareNetwork } = useWalletConnection();
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [localChain, setLocalChain] = useState('Ethereum');

    useEffect(() => {
      if (!checkNetworkSwitchPending()) {
        setShowNotification(false);
      }
    }, [checkNetworkSwitchPending]);

    // In local Hardhat mode, just update the simulated chain — no MetaMask switch
    const isHardhatLocal = network === 'Hardhat Local' && isLocalMode();

    const handleNetworkChange = async (selectedNetwork) => {
      console.log(`Network selected for ${versionId}:`, selectedNetwork);

      if (isHardhatLocal) {
        setLocalChain(selectedNetwork);
        simulatedChainEmitter.emit(selectedNetwork);
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
      if (isHardhatLocal) return "Simulate Chain";
      return network === 'Ethereum' || network === 'Flare' || network === 'Binance Smart Chain'
        ? "Switch Network" : "Choose Network to MINT";
    };

    const options = isHardhatLocal
      ? ['Ethereum', 'Flare', 'Binance Smart Chain']
      : ['Ethereum', 'Flare', 'Binance Smart Chain'];

    const selectedOption = isHardhatLocal ? localChain : network;

    return (
      <div id={versionId}>
        <Selector
          title={getTitle()}
          options={options}
          onChange={handleNetworkChange}
          selectedOption={selectedOption}
          disabledOptions={['none']}
          defaultSelected="none"
          name={versionId}
          disabled={!isHardhatLocal && checkNetworkSwitchPending()}
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
};  

// versions
const SwitchNetwork1 = createSwitchNetwork('Location1');
const SwitchNetwork2 = createSwitchNetwork('Location2');
const SwitchNetwork3 = createSwitchNetwork('Location3');
const SwitchNetwork4 = createSwitchNetwork('Location4');
const SwitchNetwork5 = createSwitchNetwork('Location5');

// passed ID
const SwitchNetwork = ({ id }) => {
  if (id === 'Location1') return <SwitchNetwork1 />;
  if (id === 'Location2') return <SwitchNetwork2 />;
  if (id === 'Location3') return <SwitchNetwork3 />;
  if (id === 'Location4') return <SwitchNetwork4 />;
  if (id === 'Location5') return <SwitchNetwork5 />;
  // No default case
};

export default SwitchNetwork;