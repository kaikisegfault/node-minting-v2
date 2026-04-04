import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ETH_ABI from '../../abis/ETH_ABI.json';

const networks = {
  ethereum: {
    chainId: '11155111', // Sepolia testnet
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
    rpcUrl: `https://sepolia.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`,
    abi: ETH_ABI
  }
};

const TestReadOnly = () => {
  const [remainingToMint, setRemainingToMint] = useState(null);

  useEffect(() => {
    console.log('TestReadOnly component mounted');

    const fetchRemainingToMint = async () => {
      try {
        console.log('Fetching remaining to mint');
        const provider = new ethers.providers.JsonRpcProvider(networks.ethereum.rpcUrl);
        const contract = new ethers.Contract(networks.ethereum.contractAddress, networks.ethereum.abi, provider);
        
        const result = await contract.abRemainingTerc20ToMintAsTnft();
        console.log('Fetched remaining to mint:', result.toString());
        setRemainingToMint(result.toString());
      } catch (error) {
        console.error("Error fetching remaining to mint:", error);
      }
    };

    fetchRemainingToMint();
  }, []); // Empty dependency array ensures the effect runs only once on component mount

  useEffect(() => {
    console.log('TestReadOnly component updated, remainingToMint:', remainingToMint);
  }, [remainingToMint]);

  return (
    <div>
      <p>Remaining to mint: {remainingToMint}</p>
    </div>
  );
};

export default TestReadOnly;