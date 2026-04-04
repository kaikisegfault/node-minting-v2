import { useCallback } from 'react';
import { ethers } from 'ethers';
import useWalletConnection from '../useWalletConnection';
import ETH_ABI from '../../abis/ETH_ABI.json';
import FLARE_ABI from '../../abis/FLARE_ABI.json';

const useWeb3Injection = () => {
  const { network } = useWalletConnection();

  const injectToWeb3 = useCallback(async (apiResponse) => {
    const { value, otherChainTnftIds, otherChainTnftAmounts, id, mintAmount, randomNonce, signature } = apiResponse;

    let contractAddress, contractABI;
    if (network.toLowerCase() === 'ethereum') {
      contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      contractABI = ETH_ABI;
    } else if (network.toLowerCase() === 'flare') {
      contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      contractABI = FLARE_ABI;
    } else {
      throw new Error('Unsupported network');
    }

    if (!contractAddress) {
      throw new Error('Contract address is undefined');
    }

    console.log('Contract Address:', contractAddress);
    console.log('Network:', network);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const transaction = await contract.mint(
      [otherChainTnftIds, otherChainTnftAmounts, id, mintAmount, randomNonce, signature],
      { value: ethers.BigNumber.from(value) }
    );

    console.log('Transaction hash:', transaction.hash);

    return { transaction, waitForReceipt: () => transaction.wait(), id, mintAmount };
  }, [network]);

  return { injectToWeb3 };
};

export default useWeb3Injection;