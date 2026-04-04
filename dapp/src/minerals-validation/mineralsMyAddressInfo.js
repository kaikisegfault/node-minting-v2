import React, { useState } from 'react';
import PopupNotification from '../ui-components/PopupNotification';
import Grid from '../ui-components/Grid';
import useWalletConnection from '../core/useWalletConnection';
import { useUserReadOnlyState } from '../core/useUserReadOnlyState';

const MineralsMyAddressInfo = () => {
    const [showPopup, setShowPopup] = useState(false);
    const { activeAddress } = useWalletConnection();
    const { mineralsAddressInfoResults } = useUserReadOnlyState();
    const { myValidatedMineralsQty, myUnvalidatedMineralsQty } = mineralsAddressInfoResults;

    const handleButtonClick = () => {
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    const formatAddress = (addr) => addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : 'Not Connected';

    const popupMessage = (
        <div>
            <Grid
                header="My Blue Minerals State"
                rows={[
                    ["Network", "Unvalidated", "Validated"],
                    [<span style={{fontWeight: 'normal'}}>Flare</span>, <span style={{fontWeight: 'normal'}}>{myUnvalidatedMineralsQty}</span>, <span style={{fontWeight: 'normal'}}>{myValidatedMineralsQty}</span>]
                ]}
            />
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

export default MineralsMyAddressInfo;