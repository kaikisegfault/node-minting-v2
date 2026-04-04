import React from 'react';
import ConnectWallet from '../smart-components/ConnectWallet';
import ConnectedStatus from '../smart-components/ConnectedStatus';
import useWalletConnection from '../core/useWalletConnection';
import BlueMineral from './BlueMineral';
import RemainingMineralsToValidate from './RemainingMineralsToValidate';
import MineralsGeneralInfo from './MineralsGeneralInfo';
import MineralsMyAddressInfo from './mineralsMyAddressInfo';
import MineralsSwitchNetwork from './MineralsSwitchNetwork';
import ValidateMinerals from './ValidateMinerals';
import MoreInfo from '../smart-components/MoreInfo';
import MineralsDummyPriceInfo from './MineralsDummyPriceInfo';

const ValidatorDapp = () => {
    const { connected, network } = useWalletConnection();

    return (
        <div className="dapp-container">
            <div className="remaining-section">
                <RemainingMineralsToValidate />
            </div>
            <div className="dapp-content">
                <div className="dapp-left-column animate-element delay5 fadeInLeft">
                    <BlueMineral />
                </div>
                <div className="dapp-right-column">
                    <div className="dapp-info-row">
                        <MineralsDummyPriceInfo />
                        <div className="wallet-section">
                            {connected && <ConnectedStatus />}
                        </div>
                        <ConnectWallet />
                    </div>
                    <div className="dapp-info-row">
                        <MineralsGeneralInfo />
                        {connected && <MineralsMyAddressInfo />}
                    </div>
                    {connected && (
                        <div className="dapp-info-row">
                            <MineralsSwitchNetwork />
                            <div className="dapp-mint-section">
                                {network === 'Flare' && <ValidateMinerals />}
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

export default ValidatorDapp;