import React, { useState, useEffect, useCallback } from 'react';
import useWalletConnection from '../core/useWalletConnection';
import { EthereumInteraction, FlareInteraction } from '../core/contractInteractions';

const BalanceOfBatchComponent = () => {
  const { connected, activeAddress } = useWalletConnection();
  const [balances, setBalances] = useState({
    ethereum: { bronze: 0, silver: 0, gold: 0, diamond: 0 },
    flare: { bronze: 0, silver: 0, gold: 0, diamond: 0 }
  });
  const [lastFetchedAddress, setLastFetchedAddress] = useState('');

  const fetchBalanceOfBatch = useCallback(async (network, address) => {
    const interaction = network === 'ethereum' ? EthereumInteraction : FlareInteraction;
    const nftIds = [1, 2, 3, 4];
    const addresses = nftIds.map(() => address);
    
    try {
      const result = await interaction.balanceOfBatch(addresses, nftIds);
      return {
        bronze: parseInt(result[0].toString() || '0'),
        silver: parseInt(result[1].toString() || '0'),
        gold: parseInt(result[2].toString() || '0'),
        diamond: parseInt(result[3].toString() || '0')
      };
    } catch (error) {
      console.error(`Error fetching balance for ${network}:`, error);
      return { bronze: 0, silver: 0, gold: 0, diamond: 0 };
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (connected && activeAddress && activeAddress !== lastFetchedAddress) {
        const ethBalance = await fetchBalanceOfBatch('ethereum', activeAddress);
        const flareBalance = await fetchBalanceOfBatch('flare', activeAddress);
        
        setBalances({
          ethereum: ethBalance,
          flare: flareBalance
        });
        
        setLastFetchedAddress(activeAddress);
      }
    };

    fetchData();
  }, [connected, activeAddress, lastFetchedAddress, fetchBalanceOfBatch]);

  if (!connected || !activeAddress) {
    return <div>Please connect your wallet to view balances.</div>;
  }

  return (
    <div>
      <h2>Your NFT Balances</h2>
      <h3>Ethereum</h3>
      <ul>
        <li>Bronze: {balances.ethereum.bronze}</li>
        <li>Silver: {balances.ethereum.silver}</li>
        <li>Gold: {balances.ethereum.gold}</li>
        <li>Diamond: {balances.ethereum.diamond}</li>
      </ul>
      <h3>Flare</h3>
      <ul>
        <li>Bronze: {balances.flare.bronze}</li>
        <li>Silver: {balances.flare.silver}</li>
        <li>Gold: {balances.flare.gold}</li>
        <li>Diamond: {balances.flare.diamond}</li>
      </ul>
    </div>
  );
};

export default BalanceOfBatchComponent;