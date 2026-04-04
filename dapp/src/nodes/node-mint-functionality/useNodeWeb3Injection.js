// useNodeWeb3Injection.js
import { useCallback } from 'react';
import { ethers } from 'ethers';
import useWalletConnection from '../../core/useWalletConnection';
import NODE_ABI from '../../abis/NODE_ABI.json';

const useNodeWeb3Injection = () => {
  const { network } = useWalletConnection();

  const injectWhitelistMint = useCallback(async () => {
    // Only proceed if on Flare network
    if (network.toLowerCase() !== 'flare') {
      throw new Error('Whitelist minting is only available on Flare network');
    }

    const contractAddress = process.env.REACT_APP_NODE_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('Contract address is undefined');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, NODE_ABI, signer);

    // Call the simple whitelistMint function
    const transaction = await contract.whitelistMint();
    console.log('Whitelist mint transaction hash:', transaction.hash);

    return { 
      transaction, 
      waitForReceipt: () => transaction.wait() 
    };
  }, [network]);

  return { injectWhitelistMint };
};

export default useNodeWeb3Injection;