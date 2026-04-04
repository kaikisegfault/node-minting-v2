// useNodeRegMintNotifications.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Spinner } from 'react-bootstrap';
import PopupNotification from '../../../ui-components/PopupNotification';
import useNodePrices from '../../useNodePrices';
import useWalletConnection from '../../../core/useWalletConnection';
import useNodeApiCommunicator from './useNodeApiCommunicator';

const CountdownTimer = ({ expiryTimestamp, onExpire, entry }) => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [hasStarted, setHasStarted] = useState(false);
    const [hasExpired, setHasExpired] = useState(false);
    const expirationTriggeredRef = useRef(false);
  
    useEffect(() => {
        if (!expiryTimestamp || hasExpired) return;
  
        const COUNTDOWN_START = 40; 
        const ADJUSTMENT = 0;
  
        if (!hasStarted) {
            console.log('Original expiryTimestamp:', expiryTimestamp);
            console.log('Timer calculation start point:', Number(expiryTimestamp) + ADJUSTMENT);
            setHasStarted(true);
        }
  
        const calculateTimeLeft = () => {
            const now = Date.now();
            const originalStart = Number(expiryTimestamp) + ADJUSTMENT;
            const elapsedSinceStart = (now - originalStart) / 1000;
            const remaining = COUNTDOWN_START - elapsedSinceStart;
            
            return Math.max(0, Math.ceil(remaining));
        };
  
        setTimeLeft(calculateTimeLeft());
  
        const timer = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);
            
            if (remaining === 0 && !hasExpired && !expirationTriggeredRef.current) {
                console.log('Timer expired at:', Date.now());
                setHasExpired(true);
                expirationTriggeredRef.current = true;
                clearInterval(timer);
                if (onExpire && entry) {
                    onExpire(entry);
                }
            }
        }, 1000);
  
        return () => clearInterval(timer);
    }, [expiryTimestamp, hasStarted, hasExpired, onExpire, entry]);
  
    if (timeLeft === null) return null;
    return `${timeLeft}s`;
};

const QueueEntry = ({ entry, onExpire }) => {
    const HIGHLIGHT_COLOR = '#9370DB';
    const { position, address, quantity, status, isConcluded, expiryTimestamp, isUserAddress } = entry;

    const getStatusDisplay = () => {
        if (status === 'Your Address') {
            return (
                <span style={{ color: HIGHLIGHT_COLOR, fontWeight: 'bold' }}>
                    Your Address
                </span>
            );
        }

        if (isConcluded) {
            return status;
        }

        if (status === 'waiting-user-confirmation') {
            return (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ 
                        color: isUserAddress ? HIGHLIGHT_COLOR : 'inherit',
                        fontWeight: isUserAddress ? 'bold' : 'normal'
                    }}>
                        {isUserAddress ? 'Confirm Request' : 'Confirming'}
                    </span>
                    <span style={{ color: '#000000' }}>
                        <CountdownTimer 
                            expiryTimestamp={expiryTimestamp} 
                            onExpire={onExpire}
                            entry={entry}
                        />
                    </span>
                    <Spinner animation="grow" variant="secondary" size="sm" />
                </span>
            );
        }

        if (status === 'waiting-receipt') {
            return (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ 
                        color: isUserAddress ? HIGHLIGHT_COLOR : 'inherit',
                        fontWeight: isUserAddress ? 'bold' : 'normal'
                    }}>
                        {isUserAddress ? 'Waiting-Receipt' : 'Waiting-Receipt'}
                    </span>
                    <Spinner animation="grow" variant="secondary" size="sm" />
                </span>
            );
        }

        if (status === 'inQueue' && expiryTimestamp) {
            return (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    idle {<CountdownTimer expiryTimestamp={expiryTimestamp} onExpire={onExpire} entry={entry} />}
                    <Spinner animation="grow" variant="secondary" size="sm" />
                </span>
            );
        }

        return status;
    };

    return (
        <div className="queue-entry" style={{ opacity: isConcluded ? 0.7 : 1 }}>
            <div className="queue-info-group">
                <span className="position" style={{ color: isConcluded ? HIGHLIGHT_COLOR : 'inherit' }}>
                    {position}
                </span>
                <span className="address">{address}</span>
                <span style={{ marginLeft: '-3px' }}>,</span>
                <span className="quantity">{quantity} Node{quantity !== 1 && 's'}</span>
            </div>
            <div className="queue-status-group">
                <span className="separator"> - </span>
                <span className="status">{getStatusDisplay()}</span>
            </div>
        </div>
    );
};

const useNodeRegMintNotifications = () => {
    const { network, activeAddress } = useWalletConnection();
    const prices = useNodePrices();
    const apiCommunicator = useNodeApiCommunicator();
    
    const [notificationState, setNotificationState] = useState({
        isOpen: false,
        mintQuantity: 0,
        type: null,
        content: null,
        queueData: null
    });

    const handleExpiration = useCallback(async (expiredEntry) => {
        if (!expiredEntry || !expiredEntry.isUserAddress) return;

        try {
            const expiryRequest = {
                address: activeAddress,
                randomNonce: expiredEntry.randomNonce,
                status: 'expired'
            };

            console.log('Sending expiry request:', expiryRequest);

            const response = await apiCommunicator.communicateWithApi(expiryRequest);
            
            if (response.success) {
                setNotificationState({
                    isOpen: true,
                    type: 'error',
                    content: 'Session Expired, Try Again'
                });
            } else {
                console.error('Failed to update expiration status:', response.error);
            }
        } catch (error) {
            console.error('Failed to handle expiration:', error);
        }
    }, [activeAddress, apiCommunicator]);

    const updateNotification = useCallback((newState) => {
        if (!newState || newState.type === null) {
            setNotificationState({
                isOpen: false,
                mintQuantity: 0,
                type: null,
                content: null,
                queueData: null
            });
            return;
        }

        if (newState.type === 'error' || newState.type === 'success') {
            setNotificationState({
                isOpen: true,
                type: newState.type,
                content: newState.content
            });
            return;
        }

        if (newState.type === 'mintStart') {
            setNotificationState(prev => ({
                ...prev,
                isOpen: true,
                mintQuantity: newState.quantity,
                type: 'minting'
            }));
        }

        if (newState.type === 'queueUpdate') {
            setNotificationState(prev => ({
                ...prev,
                queueData: newState.queueData
            }));
        }
    }, []);

    const renderNotification = useCallback(() => {
        if (!notificationState.isOpen) return null;

        if (notificationState.type === 'error' || notificationState.type === 'success') {
            return (
                <PopupNotification
                    message={notificationState.content}
                    onClose={() => updateNotification(null)}
                />
            );
        }

        const currentPrice = network === 'Ethereum'
            ? `${prices.currentNodePriceETH.toFixed(6)} ETH`
            : network === 'Binance'
            ? `${prices.currentNodePriceBNB.toFixed(6)} BNB`
            : `${prices.currentNodePriceFLR.toFixed(2)} FLR`;

        const content = (
            <div className="minting-steps-container">
                <h3>MINTING</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {notificationState.mintQuantity} Node{notificationState.mintQuantity > 1 ? 's' : ''} on {network}
                    <Spinner animation="grow" variant="secondary" size="sm" />
                </div>
                
                <div className="price-info">
                    <span>Current Node Price (LIVE): <span style={{ whiteSpace: 'nowrap' }}>{currentPrice}</span></span>
                </div>
        
                {notificationState.queueData && (
                    <div className="queue-info">
                        <div style={{ fontWeight: 'bold' }}>MINT Queue</div>
                        <div className="queue-entries" style={{ 
                            maxHeight: '200px', 
                            overflowY: 'auto',
                            marginTop: '10px'
                        }}>
                            <div style={{ padding: '0 8px' }}>
                                {notificationState.queueData.entries.map((entry, index) => (
                                    <QueueEntry 
                                        key={index} 
                                        entry={entry} 
                                        onExpire={handleExpiration}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );

        return (
            <PopupNotification
                message={content}
                onClose={() => updateNotification(null)}
            />
        );
    }, [notificationState, network, prices, updateNotification, handleExpiration]);

    return {
        updateNotification,
        renderNotification
    };
};

export default useNodeRegMintNotifications;