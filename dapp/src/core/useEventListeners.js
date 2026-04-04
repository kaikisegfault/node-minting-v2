import { useState, useEffect, useCallback } from 'react';
import { EthereumInteraction, FlareInteraction } from './contractInteractions';

export const useEventListeners = () => {
  const [eventCounter, setEventCounter] = useState(0);

  const handleEvent = useCallback((network, eventName, ...args) => {
    // universal single log
    console.log(`Event ${eventName} occurred on ${network}`);
    setEventCounter(prev => prev + 1);

    // Add detailed logging for MintListener event
    if (eventName === 'MintListener') {
      const [minter, otherChainTnftIds, otherChainTnftAmounts, id, mintAmount] = args;

      const getTnoCardType = (id) => {
        const types = ['Bronze', 'Silver', 'Gold', 'Diamond'];
        return types[id - 1] || 'Unknown';
      };

      const formatAddress = (address) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
      };

      console.log('MintListener:', {
        "1) Network": network,
        "2) Minter": formatAddress(minter),
        "3) TNO Card": getTnoCardType(id.toNumber()),
        "4) Amount": mintAmount.toString(),
        otherChainTnftIds: otherChainTnftIds.map(id => id.toString()),
        otherChainTnftAmounts: otherChainTnftAmounts.map(amount => amount.toString())
      });
    }
  }, []);

  useEffect(() => {
    const events = [
      'MintListener',
      'BurnTnftForMintTerc20Listener',
      'ReceiveTnftFromUserToOtherChainsSupplyListener',
      'burnTnftForMintERC1155Listener'
    ];

    const setupListeners = (interaction, network) => {
      events.forEach(event => {
        interaction.on(event, (...args) => handleEvent(network, event, ...args));
      });
    };

    setupListeners(EthereumInteraction, 'Ethereum');
    setupListeners(FlareInteraction, 'Flare');

    return () => {
      const removeListeners = (interaction) => {
        events.forEach(event => {
          interaction.removeAllListeners(event);
        });
      };

      removeListeners(EthereumInteraction);
      removeListeners(FlareInteraction);
    };
  }, [handleEvent]);

  return { eventCounter };
};