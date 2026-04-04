import React, { useState } from 'react';
import useWalletConnection from '../../core/useWalletConnection';
import useNodeUserMintInput from './useNodeUserMintInput';
import useNodeMintNotifications from './useNodeMintNotifications';
import useNodeMintProcess from './useNodeMintProcess';
import useNodeRegMintProcess from './reg-mint/useNodeRegMintProcess';
import useNodeRegMintNotifications from './reg-mint/useNodeRegMintNotifications';
import { isLocalMode } from '../../core/HardhatInteraction';

// nodeMintButton.js
const NodeMintButton = () => {
    const { network, connected, activeAddress } = useWalletConnection();
    const [simulatedChain, setSimulatedChain] = useState('Ethereum');
    
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
            {network === 'Hardhat Local' && isLocalMode() && (
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ color: '#aaa', marginRight: '8px' }}>Simulate Chain:</label>
                    <select
                        value={simulatedChain}
                        onChange={(e) => setSimulatedChain(e.target.value)}
                        style={{ padding: '6px 12px', background: '#1a1a2e', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                    >
                        <option value="Ethereum">Ethereum</option>
                        <option value="Flare">Flare</option>
                        <option value="Binance Smart Chain">Binance Smart Chain</option>
                    </select>
                    <span style={{ marginLeft: '10px', color: '#666', fontSize: '12px' }}>({effectiveNetwork})</span>
                </div>
            )}
            {renderQuantityInput()}
            <button className="btn-regular mint" onClick={handleMint}>MINT on {effectiveNetwork}</button>
            {renderNotification()}
            {renderRegNotification()}
        </div>
    );
};

export default NodeMintButton;