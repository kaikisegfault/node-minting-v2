// useNodeRegWeb3Injection.js
import { useCallback } from 'react';
import { ethers } from 'ethers';
import useWalletConnection from '../../../core/useWalletConnection';
import NODE_ABI from '../../../abis/NODE_ABI.json';
import { getNodeContractAddress } from '../../../config/environment';
import { isLocalMode, getLocalContractAddress } from '../../../core/HardhatInteraction';

// Helper to detect if an error is a user rejection (handles various wallet types)
const isUserRejection = (error) => {
  // Standard EIP-1193 rejection code
  if (error.code === 4001) return true;
  
  // Check error message for various wallet rejection patterns
  const errorMessage = (error.message || '').toLowerCase();
  const errorReason = (error.reason || '').toLowerCase();
  
  const rejectionPatterns = [
    'user rejected',
    'user denied',
    'user cancelled',
    'user canceled',
    'rejected by user',
    'denied by user',
    'cancelled by user',
    'canceled by user',
    'transaction was rejected',
    'user declined',
    'request rejected',
    'action rejected',
    'denied transaction',
    'user refused',
    // Hardware wallet specific patterns
    'ledger device',
    'conditions of use not satisfied', // Ledger rejection
    'rejected from ledger',
    'trezor',
    'denied by trezor',
    // WalletConnect patterns
    'rejected from wallet',
    'session disconnected',
    // Safe/Multi-sig patterns
    'transaction rejected',
    'signature request rejected'
  ];
  
  return rejectionPatterns.some(pattern => 
    errorMessage.includes(pattern) || errorReason.includes(pattern)
  );
};

// Helper to detect hardware wallet / multi-sig connection issues
const isHardwareWalletError = (error) => {
  const errorMessage = (error.message || '').toLowerCase();
  const errorReason = (error.reason || '').toLowerCase();
  
  const hardwarePatterns = [
    'ledger',
    'trezor',
    'hardware wallet',
    'device',
    'transport',
    'u2f',
    'webusb',
    'hid',
    'bluetooth',
    'disconnected',
    'locked',
    'timeout',
    'busy',
    'gnosis',
    'safe',
    'multi-sig',
    'multisig'
  ];
  
  return hardwarePatterns.some(pattern => 
    errorMessage.includes(pattern) || errorReason.includes(pattern)
  );
};

const useNodeRegWeb3Injection = () => {
  const { network } = useWalletConnection();

  const injectRegularMint = useCallback(async (mintParams) => {
    // Determine contract address based on network
    let contractAddress;
    if (isLocalMode()) {
      contractAddress = getLocalContractAddress(network);
    } else {
      contractAddress = getNodeContractAddress(network);
    }

    if (!contractAddress) {
      throw new Error('Contract address is undefined');
    }

    // Setup provider and contract
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, NODE_ABI, signer);

    // Destructure mint parameters
    const { value, otherChainQty, mintAmount, timestamp, randomNonce, signature } = mintParams;

    // Build contract parameters
    const params = {
      otherChainQty: ethers.BigNumber.from(otherChainQty),
      mintAmount: ethers.BigNumber.from(mintAmount),
      timestamp: ethers.BigNumber.from(timestamp),
      randomNonce,
      signature
    };

    try {
      // Send transaction with fixed gas limit for hardware wallet compatibility
      const transaction = await contract.mint(params, { 
        value: ethers.BigNumber.from(value),
        gasLimit: 500000  // Fixed gas limit to bypass hardware wallet estimation issues
      });
      
      console.log('Transaction hash:', transaction.hash);

      return { 
        transaction, 
        waitForReceipt: () => transaction.wait() 
      };
    } catch (error) {
      console.error('Mint transaction error:', {
        code: error.code,
        message: error.message,
        reason: error.reason,
        data: error.data
      });

      // Check if this is a user rejection (handles all wallet types including hardware)
      if (isUserRejection(error)) {
        // Re-throw with code 4001 to ensure consistent handling upstream
        const rejectionError = new Error('User rejected the transaction');
        rejectionError.code = 4001;
        throw rejectionError;
      }

      // Check if this is a hardware wallet specific issue
      if (isHardwareWalletError(error)) {
        const hwError = new Error('Hardware wallet error: Please ensure your device is connected, unlocked, and the Ethereum app is open. Then try again.');
        hwError.code = 'HARDWARE_WALLET_ERROR';
        hwError.originalError = error;
        throw hwError;
      }

      // Re-throw other errors
      throw error;
    }
  }, [network]);

  return { injectRegularMint };
};

export default useNodeRegWeb3Injection; 