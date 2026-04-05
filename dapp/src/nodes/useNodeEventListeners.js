import { useState, useEffect, useCallback } from 'react';
import { NodeEthereumInteraction, NodeFlareInteraction, NodeBSCInteraction } from '../core/contractInteractions';

export const useNodeEventListeners = () => {
  const [nodeEventCounter, setNodeEventCounter] = useState(0);

  const handleNodeEvent = useCallback((network, eventName, ...args) => {
    console.log(`Event ${eventName} occurred on ${network}`);
    setNodeEventCounter(prev => prev + 1);

    const formatAddress = (address) => {
      return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    switch (eventName) {
      case 'NodesPulled':
        const [receiver, tokenIds] = args;
        console.log('NodesPulled:', {
          "1) Network": network,
          "2) Receiver": formatAddress(receiver),
          "3) Token IDs": tokenIds.map(id => id.toString())
        });
        break;

      case 'MintListener':
        const [user, startId, endId, mintedAmount, otherChainQty] = args;
        console.log('MintListener:', {
          "1) Network": network,
          "2) User": formatAddress(user),
          "3) Start ID": startId.toString(),
          "4) End ID": endId.toString(),
          "5) Minted Amount": mintedAmount.toString(),
          "6) Other Chain Quantity": otherChainQty.toString()
        });
        break;

      case 'a4ReceiveTnftFromUserToOtherChainsSupplyListener':
        const [userAddress, tokenIdArray, txAmount, eventId] = args;
        console.log('a4ReceiveTnftFromUserToOtherChainsSupplyListener:', {
          "1) Network": network,
          "2) User": formatAddress(userAddress),
          "3) Token IDs": tokenIdArray.map(id => id.toString()),
          "4) Transaction Amount": txAmount.toString(),
          "5) Event ID": eventId.toString()
        });
        break;

      case 'CrossChainTransferCompleted':
        const [recipient, transferStartId, transferEndId, totalAmount] = args;
        console.log('CrossChainTransferCompleted:', {
          "1) Network": network,
          "2) Recipient": formatAddress(recipient),
          "3) Start ID": transferStartId.toString(),
          "4) End ID": transferEndId.toString(),
          "5) Total Amount": totalAmount.toString()
        });
        break;

      case 'WhitelistMinted':
        const [minter, whitelistStartId, quantity] = args;
        console.log('WhitelistMinted:', {
          "1) Network": network,
          "2) Minter": formatAddress(minter),
          "3) Start ID": whitelistStartId.toString(),
          "4) Quantity": quantity.toString()
        });
        break;

      default:
        console.log(`Unhandled event ${eventName} with args:`, args);
    }
  }, []);

  useEffect(() => {
    const events = [
      'NodesPulled',
      'MintListener',
      'a4ReceiveTnftFromUserToOtherChainsSupplyListener',
      'CrossChainTransferCompleted',
      'WhitelistMinted'
    ];

    const setupNodeListeners = (interaction, network) => {
      if (!interaction || typeof interaction.on !== 'function') return;
      events.forEach(event => {
        interaction.on(event, (...args) => handleNodeEvent(network, event, ...args));
      });
    };

    const removeNodeListeners = (interaction) => {
      if (!interaction || typeof interaction.removeAllListeners !== 'function') return;
      events.forEach(event => {
        interaction.removeAllListeners(event);
      });
    };

    setupNodeListeners(NodeEthereumInteraction, 'Ethereum');
    setupNodeListeners(NodeFlareInteraction, 'Flare');
    setupNodeListeners(NodeBSCInteraction, 'Binance');

    return () => {
      removeNodeListeners(NodeEthereumInteraction);
      removeNodeListeners(NodeFlareInteraction);
      removeNodeListeners(NodeBSCInteraction);
    };
  }, [handleNodeEvent]);

  return { nodeEventCounter };
};
