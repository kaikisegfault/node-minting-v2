import React, { useState } from 'react';
import PopupNotification from '../ui-components/PopupNotification';
import Grid from '../ui-components/Grid';
import useWalletConnection from '../core/useWalletConnection';
import { useNodeUserReadOnlyState } from './useNodeUserReadOnlyState';

const NodeMyAddressInfo = () => {
    const [showPopup, setShowPopup] = useState(false);
    const { activeAddress } = useWalletConnection();
    const {
        EthA6AddressEscrowHoldingsResults,
        FlareA6AddressEscrowHoldingsResults
    } = useNodeUserReadOnlyState();

    const handleButtonClick = () => {
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    const formatAddress = (addr) => addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : 'Not Connected';

    const ethQuantity = EthA6AddressEscrowHoldingsResults?.total || 0;
    const flareQuantity = FlareA6AddressEscrowHoldingsResults?.total || 0;
    const totalQuantity = ethQuantity + flareQuantity;

    const useTestData = false;
    const testEthIds = useTestData ? Array.from({length: 50}, (_, i) => i + 1) : [];
    const testFlareIds = useTestData ? Array.from({length: 50}, (_, i) => i + 51) : [];

    const ethNodeIds = useTestData ? testEthIds : (EthA6AddressEscrowHoldingsResults?.ids || []);
    const flareNodeIds = useTestData ? testFlareIds : (FlareA6AddressEscrowHoldingsResults?.ids || []);

    const getExplorerUrl = (networkId, tokenId) => {
        const ethContractAddress = process.env.REACT_APP_NODE_CONTRACT_ADDRESS;
        const flareContractAddress = process.env.REACT_APP_NODE_CONTRACT_ADDRESS;
    
        if (networkId === 'eth') {
            return `https://etherscan.io/nft/${ethContractAddress}/${tokenId}`;
        } else if (networkId === 'flare') {
            return `https://flare-explorer.flare.network/token/${flareContractAddress}/instance/${tokenId}`;
        }
        return '#';
    };

    const gridRows = [
        ["Network", "Total Quantity"]
    ];

    if (ethQuantity > 0) {
        gridRows.push(["Ethereum", ethQuantity].map(item => 
            <span className="grid-row-normal">{item}</span>
        ));
    }
    if (flareQuantity > 0) {
        gridRows.push(["Flare", flareQuantity].map(item => 
            <span className="grid-row-normal">{item}</span>
        ));
    }

    const NodeIdsBox = ({ title, ids, networkId }) => {
        if (!ids || ids.length === 0) return null;
        
        return (
            <div style={{ marginTop: '20px' }}>
                <div style={{ 
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    textAlign: 'left',
                    marginBottom: '10px'
                }}>
                    {title}
                </div>
                <div 
                    style={{ 
                        maxHeight: '120px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '8px',
                        overflowY: 'overlay',
                        position: 'relative'
                    }}
                    className="node-ids-scroll"
                >
                    <div style={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        {ids.map((id, index) => (
                            <a
                                key={`${networkId}-${id}`}
                                href={getExplorerUrl(networkId, id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                    backgroundColor: '#f7fafc',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    whiteSpace: 'nowrap',
                                    fontSize: '14px',
                                    display: 'inline-block',
                                    textDecoration: 'none',
                                    color: '#4a5568',
                                    transition: 'background-color 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#edf2f7';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#f7fafc';
                                }}
                            >
                                {id.toString()}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const popupMessage = totalQuantity === 0 ? (
        <div>
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
                No registered Nodes on the connected address.
            </div>
            <div className='addr-t' style={{ marginTop: '20px', textAlign: 'center' }}>
                <span className='addr'>Address:</span> {formatAddress(activeAddress)}
            </div>
        </div>
    ) : (
        <div>
            <Grid
                header="My EXPL Nodes"
                rows={gridRows}
            />

            {ethNodeIds.length > 0 && <NodeIdsBox title="EXPL Node IDs (Ethereum)" ids={ethNodeIds} networkId="eth" />}
            {flareNodeIds.length > 0 && <NodeIdsBox title="EXPL Node IDs (Flare Network)" ids={flareNodeIds} networkId="flare" />}

            <div className='addr-t' style={{ marginTop: '20px', textAlign: 'center' }}>
                <span className='addr'>Address:</span> {formatAddress(activeAddress)}
            </div>
        </div>
    );

    return (
        <div>
            <button className="btn-regular info" onClick={handleButtonClick}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7-24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
                </svg>
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

export default NodeMyAddressInfo;