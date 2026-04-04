import React from 'react';
import useWalletConnection from '../core/useWalletConnection';
import useUserMintInput from '../core/user-interactions/useUserMintInput';
import useMintProcess from '../core/user-interactions/useMintProcess';
import useMintNotifications from '../core/user-interactions/useMintNotifications';

const createMintTransfer = (locationId) => {
  return () => {
    const { network, connected } = useWalletConnection();
    const { renderQuantityInput, processMintInput } = useUserMintInput(locationId);
    const { updateNotification, renderNotification } = useMintNotifications();
    const { executeMintProcess } = useMintProcess(updateNotification);

    const handleMint = async () => {
      await executeMintProcess(processMintInput);
    };

    const isEthereumOrFlare = network === 'Ethereum' || network === 'Flare';

    if (!isEthereumOrFlare || !connected) {
      return null; 
    }

    return (
      <div id={locationId}>
        {renderQuantityInput()}
        <button className="btn-regular mint" onClick={handleMint}>MINT</button>
        {renderNotification()}
      </div>
    );
  };
};

// versions
const MintTransfer1 = createMintTransfer('Location1');
const MintTransfer2 = createMintTransfer('Location2');
const MintTransfer3 = createMintTransfer('Location3');
const MintTransfer4 = createMintTransfer('Location4');

// passed ID
const MintTransfer = ({ id }) => {
  if (id === 'Location1') return <MintTransfer1 />;
  if (id === 'Location2') return <MintTransfer2 />;
  if (id === 'Location3') return <MintTransfer3 />;
  if (id === 'Location4') return <MintTransfer4 />;
  // No default case
};

export default MintTransfer;