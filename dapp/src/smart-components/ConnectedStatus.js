import React, { useState, useEffect } from 'react';
import useWalletConnection from '../core/useWalletConnection';
import PopupNotification from '../ui-components/PopupNotification';

const ConnectedStatus = () => {
  const { connected, addresses, activeAddress } = useWalletConnection();
  const [showAddressesPopup, setShowAddressesPopup] = useState(false);
  const [newAddress, setNewAddress] = useState(null);

  // added block
  useEffect(() => {
    if (connected && activeAddress && !addresses.includes(activeAddress)) {
      setNewAddress(activeAddress);
    } else {
      setNewAddress(null);
    }
  }, [connected, activeAddress, addresses]);


  useEffect(() => {
    if (newAddress && addresses.includes(newAddress)) {
      setNewAddress(null);
    }
  }, [addresses, newAddress]);

  const formatAddress = (addr) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  const renderAddresses = () => {
    if (addresses.length === 0) return <p>No Address Detected</p>;

    const sortedAddresses = [
      activeAddress,
      ...addresses.filter(addr => addr !== activeAddress)
    ];
    
    return (
      <div>
        <p className='connected-header'>{sortedAddresses.length === 1 ? "Connected:" : "Connected:"}</p>
        <ul className='addresses-ul'>
          {sortedAddresses.slice(0, 2).map((addr, index) => (
            <li key={index}>
              {formatAddress(addr)}
              {addr === activeAddress && (
                <span style={{ marginLeft: '5px', color: '#a147e1', fontSize: '0.8em' }}>
                  (active)
                </span>
              )}
            </li>
          ))}
        </ul>
        {addresses.length > 2 && (
          <button onClick={() => setShowAddressesPopup(true)}>Show More</button>
        )}
      </div>
    );
  };

  return (
    <div>
      {connected ? (
        <>
          <div>{renderAddresses()}</div>
        </>
      ) : (
        <p>No Address Detected</p>
      )}

      {/* Popup for showing all connected addresses */}
      {showAddressesPopup && (
        <PopupNotification
          message={
            <div>
              <h3>Connected Addresses</h3>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {addresses.map((addr, index) => (
                  <li key={index} style={{ marginBottom: '10px' }}>
                    <div>{formatAddress(addr)}</div>
                    {addr === activeAddress && (
                      <div style={{ color: '#9370DB', fontSize: '0.8em' }}>
                        (active)
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          }
          onClose={() => setShowAddressesPopup(false)}
        />
      )}
    </div>
  );
};

export default ConnectedStatus;