import { useState, useEffect, useCallback } from 'react';
import { IS_STAGING } from '../config/environment';

// Network change emitter for synchronizing multiple instances
const networkChangeEmitter = {
  listeners: new Set(),
  emit(network) {
    this.listeners.forEach(listener => listener(network));
  },
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
};

// Global state management
let isGlobalConnecting = false;
let isGlobalNetworkSwitchPending = false;
let lastNetworkSwitch = 0;
const NETWORK_SWITCH_COOLDOWN = 2000; // 2 seconds cooldown between network switches

const useWalletConnection = () => {
  // State management
  const [connected, setConnected] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [network, setNetwork] = useState('');
  const [chainId, setChainId] = useState('');
  const [activeAddress, setActiveAddress] = useState('');
  const [switchError, setSwitchError] = useState(null);

  // Network update function with emitter
  const updateNetwork = useCallback((newNetwork, emitChange = true) => {
    setNetwork(newNetwork);
    if (emitChange) {
      networkChangeEmitter.emit(newNetwork);
    }
  }, []);

  // Add Flare Network to MetaMask
  const addFlareNetwork = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xe',
            chainName: 'Flare Mainnet',
            nativeCurrency: {
              name: 'Flare',
              symbol: 'FLR',
              decimals: 18
            },
            rpcUrls: ['https://flare-api.flare.network/ext/bc/C/rpc'],
            blockExplorerUrls: ['https://flare-explorer.flare.network']
          }]
        });
        console.log('Flare network added successfully');
        return true;
      } catch (error) {
        console.error('Failed to add Flare network:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Check current connection status
  const checkConnection = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setConnected(true);
        setAddresses(accounts);
        setActiveAddress(accounts[0]);
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(chainId);
        const networkName = chainIdToName(chainId);
        updateNetwork(networkName, false);
      } else {
        setConnected(false);
        setAddresses([]);
        setActiveAddress('');
        updateNetwork('', false);
      }
    } catch (error) {
      console.error("Failed to check connection:", error);
    }
  }, [updateNetwork]);

  // Connect wallet
  const connect = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      if (isGlobalConnecting) {
        console.log("Connection request already pending.");
        return { success: false, cancelled: false };
      }
      isGlobalConnecting = true;
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setConnected(true);
        setAddresses(accounts);
        setActiveAddress(accounts[0]);
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(chainId);
        const networkName = chainIdToName(chainId);
        updateNetwork(networkName, true);
        return { success: true, cancelled: false };
      } catch (error) {
        console.error("Failed to connect:", error);
        if (error.code === 4001) {
          return { success: false, cancelled: true };
        }
        return { success: false, cancelled: false };
      } finally {
        isGlobalConnecting = false;
      }
    }
    return { success: false, cancelled: false };
  }, [updateNetwork]);

  // Switch network with improved stability
  const switchNetwork = useCallback(async (newNetwork) => {
    if (!window.ethereum || isGlobalNetworkSwitchPending) {
      throw new Error("Network switch already pending");
    }

    const now = Date.now();
    if (now - lastNetworkSwitch < NETWORK_SWITCH_COOLDOWN) {
      throw new Error("Please wait before switching networks again");
    }

    try {
      isGlobalNetworkSwitchPending = true;
      lastNetworkSwitch = now;
      setSwitchError(null);

      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const targetChainId = networkToChainId(newNetwork);

      if (currentChainId.toLowerCase() === targetChainId.toLowerCase()) {
        updateNetwork(newNetwork);
        return true;
      }

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902 && newNetwork === 'Flare') {
          await addFlareNetwork();
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
        } else {
          throw switchError;
        }
      }

      updateNetwork(newNetwork);
      setChainId(targetChainId);
      return true;
    } catch (error) {
      console.error('Failed to switch network:', error);
      setSwitchError(error);
      throw error;
    } finally {
      isGlobalNetworkSwitchPending = false;
    }
  }, [updateNetwork, addFlareNetwork]);

  // Handle chain changes
  const handleChainChanged = useCallback(async (newChainId) => {
    console.log('Chain changed to:', newChainId);
    setChainId(newChainId);
    const networkName = chainIdToName(newChainId);
    updateNetwork(networkName);
    await checkConnection();
  }, [checkConnection, updateNetwork]);

  // Network change subscription
  useEffect(() => {
    const unsubscribe = networkChangeEmitter.subscribe((newNetwork) => {
      if (network !== newNetwork) {
        setNetwork(newNetwork);
      }
    });
    return () => unsubscribe();
  }, [network]);

  // Wallet events subscription
  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', checkConnection);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Initial connection check
    checkConnection();

    return () => {
      window.ethereum.removeListener('accountsChanged', checkConnection);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [checkConnection, handleChainChanged]);

  return {
    connected,
    addresses,
    activeAddress,
    network,
    chainId,
    switchError,
    connect,
    switchNetwork,
    checkConnecting: () => isGlobalConnecting,
    checkNetworkSwitchPending: () => isGlobalNetworkSwitchPending,
    addFlareNetwork
  };
};

// Chain ID mappings
const chainIdToName = (chainId) => {
  switch (chainId.toLowerCase()) {
    case '0x1':
      return 'Ethereum';
    case '0xaa36a7':
      // Sepolia: on staging treated as Ethereum, on production shown as testnet
      return IS_STAGING ? 'Ethereum' : 'Sepolia Testnet';
    case '0x38':
      return 'Binance';
    case '0x61':
      // BSC Testnet: on staging treated as Binance
      return IS_STAGING ? 'Binance' : 'Unknown Network';
    case '0xe':
      return 'Flare';
    case '0x72':
      return IS_STAGING ? 'Flare' : 'Flare Testnet';
    case '0xa86a':
      return 'Avalanche';
    case '0x13':
      return 'Songbird';
    case '0x25':
      return 'Songbird Testnet';
    case '0x7a69':
      return 'Hardhat Local';
    default:
      return 'Unknown Network';
  }
};

const networkToChainId = (network) => {
  if (IS_STAGING) {
    switch (network) {
      case 'Ethereum': return '0xaa36a7';  // Sepolia
      case 'Flare': return '0xe';          // Flare mainnet (cheap, used for staging)
      case 'Binance': return '0x61';       // BSC Testnet
      default: throw new Error('Unknown network');
    }
  }
  switch (network) {
    case 'Ethereum': return '0x1';
    case 'Flare': return '0xe';
    case 'Binance': return '0x38';
    default: throw new Error('Unknown network');
  }
};

export default useWalletConnection;