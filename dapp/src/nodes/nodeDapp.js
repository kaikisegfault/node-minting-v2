import React from 'react';
import ConnectWallet from '../smart-components/ConnectWallet';
import ConnectedStatus from '../smart-components/ConnectedStatus';
import SwitchNetwork from '../smart-components/SwitchNetwork';
import useWalletConnection from '../core/useWalletConnection';
import NodeGeneralInfo from './NodeGeneralInfo';
import NodeRemainingToMint from './NodeRemainingToMint';
import NodePriceInfo from './NodePriceInfo';
import MoreInfo from '../smart-components/MoreInfo';
import NodeImage from './nodeImage';
import NodeMyAddressInfo from './nodeMyAddressInfo';
import NodeMintButton from './node-mint-functionality/nodeMintButton';

const NodeDapp = ({ locationId }) => {
    const { connected } = useWalletConnection();

    return (
        <div className="dapp-container">
            <div className="remaining-section">
                <NodeRemainingToMint />
            </div>
            <div className="dapp-content">
                <div className="dapp-left-column animate-element delay5 fadeInLeft">
                    <NodeImage />
                </div>
                <div className="dapp-right-column">
                    <div className="dapp-info-row">
                        <NodePriceInfo />
                        <div className="wallet-section">
                            {connected && <ConnectedStatus />}
                        </div>
                        <ConnectWallet />
                    </div>
                    <div className="dapp-info-row">
                        <NodeGeneralInfo />
                        {connected && <NodeMyAddressInfo />}
                    </div>
                    {connected && (
                        <div className="dapp-info-row">
                            <SwitchNetwork id={locationId} />
                            <div className="dapp-mint-section">
                            <div className="dapp-mint-section">
                                <NodeMintButton />
                            </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="dapp-footer animate-element delay5 fadeInUp">
                <MoreInfo />
            </div>
        </div>
    );
};

export default NodeDapp;