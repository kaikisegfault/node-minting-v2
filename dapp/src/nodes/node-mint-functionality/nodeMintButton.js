import React from 'react';
import useWalletConnection from '../../core/useWalletConnection';
import useNodeUserMintInput from './useNodeUserMintInput';
import useNodeMintNotifications from './useNodeMintNotifications';
import useNodeMintProcess from './useNodeMintProcess';
import useNodeRegMintProcess from './reg-mint/useNodeRegMintProcess';
import useNodeRegMintNotifications from './reg-mint/useNodeRegMintNotifications';

// nodeMintButton.js
const NodeMintButton = () => {
    const { network, connected, activeAddress } = useWalletConnection();
    
    // Regular minting notifications - moved up
    const { updateNotification: updateRegNotification, renderNotification: renderRegNotification } = useNodeRegMintNotifications();
    
    // Now we can safely use updateRegNotification
    // eslint-disable-next-line
    const { renderQuantityInput, processMintInput, quantity } = useNodeUserMintInput(updateRegNotification);
    
    // Whitelist minting
    const { updateNotification, renderNotification } = useNodeMintNotifications();
    const { executeMintProcess } = useNodeMintProcess(updateNotification);
    
    // Regular minting
    const { executeRegularMint } = useNodeRegMintProcess(updateRegNotification);

    const handleMint = async () => {
        const result = await processMintInput();

        if (result.step === 'error') {
            updateRegNotification({
                type: 'error',
                content: result.content
            });
            return;
        }

        if (result.step === 'userPreAuthorization') {
            await executeRegularMint({
                quantity: result.selectedQuantity,
                address: activeAddress,
                network: network
            });
        } else {
            await executeMintProcess(() => Promise.resolve(result));
        }
    };

    const isEthereumOrFlare = network === 'Ethereum' || network === 'Flare' || network === 'Binance';

    if (!isEthereumOrFlare || !connected) {
        return null;
    }

    return (
        <div className="node-mint-container">
            {renderQuantityInput()}
            <button className="btn-regular mint" onClick={handleMint}>MINT</button>
            {renderNotification()}
            {renderRegNotification()}
        </div>
    );
};

export default NodeMintButton;