import React, { useState, useEffect } from 'react';
import useWalletConnection from '../../core/useWalletConnection';
import useNodeUserMintInput from './useNodeUserMintInput';
import useNodeMintNotifications from './useNodeMintNotifications';
import useNodeMintProcess from './useNodeMintProcess';
import useNodeRegMintProcess from './reg-mint/useNodeRegMintProcess';
import useNodeRegMintNotifications from './reg-mint/useNodeRegMintNotifications';
import { isLocalMode, simulatedChainEmitter } from '../../core/HardhatInteraction';

// nodeMintButton.js
const NodeMintButton = () => {
    const { network, connected, activeAddress } = useWalletConnection();
    const [simulatedChain, setSimulatedChain] = useState(simulatedChainEmitter.getCurrent());

    // Listen for chain changes from SwitchNetwork selector
    useEffect(() => {
        return simulatedChainEmitter.subscribe(setSimulatedChain);
    }, []);
    
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

    // In Hardhat mode, use the simulated chain name; otherwise use real network
    const effectiveNetwork = (network === 'Hardhat Local' && isLocalMode()) ? simulatedChain : network;

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
                network: effectiveNetwork
            });
        } else {
            await executeMintProcess(() => Promise.resolve(result));
        }
    };

    const isSupportedNetwork = network === 'Ethereum' || network === 'Flare' || network === 'Binance Smart Chain' || network === 'Hardhat Local';

    if (!isSupportedNetwork || !connected) {
        return null;
    }

    return (
        <div className="node-mint-container">
            {renderQuantityInput()}
            <button className="btn-regular mint" onClick={handleMint}>MINT on {effectiveNetwork}</button>
            {renderNotification()}
            {renderRegNotification()}
        </div>
    );
};

export default NodeMintButton;