// useNodeRegWeb3Injection.js
import { useCallback } from 'react';
import { ethers } from 'ethers';
import useWalletConnection from '../../../core/useWalletConnection';
import NODE_ABI from '../../../abis/NODE_ABI.json';
import { getNodeContractAddress, getChainConfig } from '../../../config/environment';
import { isLocalMode, getLocalContractAddress } from '../../../core/HardhatInteraction';

const isUserRejection = (error) => {
  if (error.code === 4001) return true;
  const errorMessage = (error.message || '').toLowerCase();
  const errorReason = (error.reason || '').toLowerCase();
  const rejectionPatterns = [
    'user rejected', 'user denied', 'user cancelled', 'user canceled',
    'rejected by user', 'denied by user', 'transaction was rejected',
    'user declined', 'request rejected', 'action rejected',
    'conditions of use not satisfied', 'rejected from ledger',
    'denied by trezor', 'rejected from wallet', 'transaction rejected',
    'signature request rejected'
  ];
  return rejectionPatterns.some(pattern =>
    errorMessage.includes(pattern) || errorReason.includes(pattern)
  );
};

const isHardwareWalletError = (error) => {
  const errorMessage = (error.message || '').toLowerCase();
  const errorReason = (error.reason || '').toLowerCase();
  const hardwarePatterns = [
    'ledger', 'trezor', 'hardware wallet', 'device', 'transport',
    'u2f', 'webusb', 'hid', 'bluetooth', 'disconnected', 'locked',
    'timeout', 'busy', 'gnosis', 'safe', 'multi-sig', 'multisig'
  ];
  return hardwarePatterns.some(pattern =>
    errorMessage.includes(pattern) || errorReason.includes(pattern)
  );
};

/**
 * Ensures MetaMask is on the correct chain before sending a transaction.
 * If not, attempts to switch and waits for confirmation.
 */
const ensureCorrectChain = async (network) => {
  if (!window.ethereum) throw new Error('No wallet detected');

  const chainConfig = getChainConfig(network);
  const targetChainId = chainConfig.chainId;
  const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

  if (currentChainId.toLowerCase() === targetChainId.toLowerCase()) {
    return; // Already on correct chain
  }

  console.log(`Switching wallet from ${currentChainId} to ${targetChainId} for ${network}`);

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChainId }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      // Chain not added to wallet — add it
      const chainConfigs = {
        'Ethereum': null, // Ethereum mainnet always exists
        'Flare': { chainId: '0xe', chainName: 'Flare Mainnet', nativeCurrency: { name: 'Flare', symbol: 'FLR', decimals: 18 }, rpcUrls: ['https://flare-api.flare.network/ext/bc/C/rpc'], blockExplorerUrls: ['https://flare-explorer.flare.network'] },
        'Binance': { chainId: '0x38', chainName: 'BNB Smart Chain', nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }, rpcUrls: ['https://bsc-dataseed.binance.org/'], blockExplorerUrls: ['https://bscscan.com/'] },
      };
      const addConfig = chainConfigs[network];
      if (addConfig) {
        await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [addConfig] });
      }
    } else {
      throw switchError;
    }
  }

  // Verify the switch actually happened
  const newChainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (newChainId.toLowerCase() !== targetChainId.toLowerCase()) {
    throw new Error(`Please switch your wallet to ${network} network and try again`);
  }
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

    // Ensure wallet is on the correct chain BEFORE creating provider
    await ensureCorrectChain(network);

    // Setup provider and contract (now guaranteed to be on correct chain)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, NODE_ABI, signer);

    const { value, otherChainQty, mintAmount, timestamp, randomNonce, signature } = mintParams;

    const params = {
      otherChainQty: ethers.BigNumber.from(otherChainQty),
      mintAmount: ethers.BigNumber.from(mintAmount),
      timestamp: ethers.BigNumber.from(timestamp),
      randomNonce,
      signature
    };

    try {
      const transaction = await contract.mint(params, {
        value: ethers.BigNumber.from(value),
        gasLimit: 500000
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

      if (isUserRejection(error)) {
        const rejectionError = new Error('User rejected the transaction');
        rejectionError.code = 4001;
        throw rejectionError;
      }

      if (isHardwareWalletError(error)) {
        const hwError = new Error('Hardware wallet error: Please ensure your device is connected, unlocked, and the Ethereum app is open. Then try again.');
        hwError.code = 'HARDWARE_WALLET_ERROR';
        hwError.originalError = error;
        throw hwError;
      }

      throw error;
    }
  }, [network]);

  return { injectRegularMint };
};

export default useNodeRegWeb3Injection;
