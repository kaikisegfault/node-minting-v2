import React, { useState } from 'react';
import PopupNotification from '../ui-components/PopupNotification';
import Grid from '../ui-components/Grid';
import useWalletConnection from '../core/useWalletConnection';
import { useUserReadOnlyState } from '../core/useUserReadOnlyState';

const PersonalAddressInfo = () => {
    const [showPopup, setShowPopup] = useState(false);
    const { activeAddress } = useWalletConnection();
    const {
        EthBalanceOfBatchResults,
        FlareBalanceOfBatchResults,
        EthCurrentChainAddressTotalTerc20AsTnftResult,
        FlareCurrentChainAddressTotalTerc20AsTnftResult
    } = useUserReadOnlyState();

    const handleButtonClick = () => {
        // document.getElementById('fp-nav').style.zIndex = -1;
        setShowPopup(true);
    };

    const closePopup = () => {
        // document.getElementById('fp-nav').style.zIndex = 9;
        setShowPopup(false);
    };

    const formatAddress = (addr) => addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : 'Not Connected';

    const totalBronze = (EthBalanceOfBatchResults?.bronze || 0) + (FlareBalanceOfBatchResults?.bronze || 0);
    const totalSilver = (EthBalanceOfBatchResults?.silver || 0) + (FlareBalanceOfBatchResults?.silver || 0);
    const totalGold = (EthBalanceOfBatchResults?.gold || 0) + (FlareBalanceOfBatchResults?.gold || 0);
    const totalDiamond = (EthBalanceOfBatchResults?.diamond || 0) + (FlareBalanceOfBatchResults?.diamond || 0);
    const totalExpl = (EthCurrentChainAddressTotalTerc20AsTnftResult || 0) + (FlareCurrentChainAddressTotalTerc20AsTnftResult || 0);

    const popupMessage = (
        <div>
            <Grid
                header="My TNO Cards"
                rows={[
                    ["Network", "Bronze", "Silver", "Gold", "Diamond"],
                    ["Ethereum", EthBalanceOfBatchResults.bronze, EthBalanceOfBatchResults.silver, EthBalanceOfBatchResults.gold, EthBalanceOfBatchResults.diamond],
                    ["Flare", FlareBalanceOfBatchResults.bronze, FlareBalanceOfBatchResults.silver, FlareBalanceOfBatchResults.gold, FlareBalanceOfBatchResults.diamond],
                    ["TOTAL", totalBronze, totalSilver, totalGold, totalDiamond]
                ]}
            />

            <div style={{ marginTop: '20px' }}>
                <Grid
                    className='gr-header-special' header="My $EXPL allocation from TNO cards"
                    rows={[
                        ["Network", "$EXPL"],
                        ["Ethereum", EthCurrentChainAddressTotalTerc20AsTnftResult.toLocaleString()],
                        ["Flare", FlareCurrentChainAddressTotalTerc20AsTnftResult.toLocaleString()],
                        ["TOTAL", totalExpl.toLocaleString()]
                    ]}
                />
            </div>


            <div className='addr-t' style={{ marginTop: '20px', textAlign: 'center' }}>
                <span className='addr'>Address:</span>  {formatAddress(activeAddress)}
            </div>
        </div>
    );

    return (
        <div>
            <button className="btn-regular info" onClick={handleButtonClick}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" /></svg>
                My Address Info
            </button>
            {showPopup && (
                <PopupNotification
                    message={popupMessage}
                    onClose={closePopup}
                />
            )}
        </div>
    );
};

export default PersonalAddressInfo;