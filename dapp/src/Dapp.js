import React from 'react';
import ConnectWallet from './smart-components/ConnectWallet';
import ConnectedStatus from './smart-components/ConnectedStatus';
import SwitchNetwork from './smart-components/SwitchNetwork';
import MintTransfer from './smart-components/MintTransfer';
import useWalletConnection from './core/useWalletConnection';
import PersonalAddressInfo from './smart-components/myAddressInfo';
import GeneralInfo from './smart-components/GeneralInfo';
import RemainingToMint from './smart-components/RemainingToMint';
import PriceInfo from './smart-components/PriceInfo';
import MoreInfo from './smart-components/MoreInfo';
import TnoCards from './smart-components/TnoCards';

const Dapp = ({ locationId }) => {
    const { connected } = useWalletConnection();

    return (
        <div className="dapp-container">
            <div className="remaining-section">
                <RemainingToMint />
            </div>
            <div className="dapp-content">
                <div className="dapp-left-column animate-element delay5 fadeInLeft">
                    <TnoCards id={locationId} />
                </div>
                <div className="dapp-right-column ">
                    <div className="dapp-info-row">
                        <PriceInfo id={locationId} />
                        <div className="wallet-section">
                            {connected && <ConnectedStatus />}
                        </div>
                        <ConnectWallet />
                    </div>
                    <div className="dapp-info-row">
                        <GeneralInfo id={locationId} />
                        {connected && <PersonalAddressInfo />}
                    </div>
                    {connected && (
                        <div className="dapp-info-row">
                            <SwitchNetwork id={locationId} />
                            <div className="dapp-mint-section">
                                <MintTransfer id={locationId} />
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

export default Dapp;