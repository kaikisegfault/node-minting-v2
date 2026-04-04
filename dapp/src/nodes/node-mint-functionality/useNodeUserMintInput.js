import { ethers } from 'ethers';
import React, { useCallback, useState } from 'react';
import useWalletConnection from '../../core/useWalletConnection';
import useNodePrices from '../useNodePrices';
import QuantityInput from '../../ui-components/QuantityInput';
import { useNodeFunctions } from '../nodeAllFunctions';
import CountdownTimer from './CountdownTimer';

const useNodeUserMintInput = (updateRegNotification) => {
  // Hook State and Context
  const { network, activeAddress } = useWalletConnection();
  const nodePrices = useNodePrices();
  const nodeFunctions = useNodeFunctions();
  const [quantity, setQuantity] = useState(1);
  const maxQtyToMint = 100;

  // Helper Functions
  const formatNumber = (value, decimals) => {
    const parts = ethers.utils.formatEther(value).split('.');
    const integerPart = parseInt(parts[0]).toLocaleString();
    const decimalPart = parts[1] ? parts[1].slice(0, decimals) : '0'.repeat(decimals);
    return `${integerPart}.${decimalPart}`;
  };

  const detectPriceAnomaly = useCallback(() => {
    const ethUsd = nodePrices.EthUsdConversion;
    const flrUsd = nodePrices.FlrUsdConversion;

    if (network.toLowerCase() === 'ethereum' && ethUsd <= 0) {
      return true;
    }
    if (network.toLowerCase() === 'flare' && flrUsd <= 0) {
      return true;
    }
    return false;
  }, [network, nodePrices]);

  const getNativeBalance = useCallback(async () => {
    return nodeFunctions.getNativeBalance(network.toLowerCase(), activeAddress);
  }, [network, activeAddress, nodeFunctions]);

  // Whitelist Related Functions
  const checkWhitelistStatus = useCallback(async () => {
    try {
      const whitelistStatus = await nodeFunctions.getWhitelistStatus('flare', activeAddress);

      if (whitelistStatus) {
        const { isWhitelisted, hasMinted, eligibleQuantity } = whitelistStatus;
        
        if (isWhitelisted && !hasMinted) {
          const whitelistPaused = await nodeFunctions.getWhitelistPaused('flare');
          return {
            isEligible: true,
            isPaused: whitelistPaused,
            quantity: eligibleQuantity
          };
        }
      }

      return {
        isEligible: false,
        isPaused: false,
        quantity: 0
      };
    } catch (error) {
      console.error("Error checking whitelist status:", error);
      return {
        isEligible: false,
        isPaused: false,
        quantity: 0
      };
    }
  }, [activeAddress, nodeFunctions]);

  // Price Calculation Functions
  const calculateRequiredAmount = useCallback(async () => {
    try {
        // Get current supplies
        const ethSupply = await nodeFunctions.getA1CurrentChainTnftSupply('ethereum');
        const flareSupply = await nodeFunctions.getA1CurrentChainTnftSupply('flare');
        const whitelistMintCount = await nodeFunctions.getWhitelistMintedCount('flare');
        
        // Calculate regular mint supply (excluding whitelist mints)
        const regularSupply = ethSupply.add(flareSupply).sub(whitelistMintCount);
        
        // Calculate start and end IDs for price calculation
        const startId = regularSupply.add(1);
        const endId = regularSupply.add(quantity);

        // Get USD price using Flare contract (already total for all nodes)
        const priceInUSD = await nodeFunctions.getBatchPriceInUSD('flare', startId, endId);

        // Convert to native token price
        const { EthUsdConversion, FlrUsdConversion } = nodePrices;
        const tokenUsdPrice = network.toLowerCase() === 'ethereum' ? EthUsdConversion : FlrUsdConversion;
        
        // Calculate native price and convert to WEI
        const nativePrice = priceInUSD.toString() / tokenUsdPrice;
        
        // Format the number to a fixed number of decimals before parsing
        const formattedPrice = nativePrice.toFixed(18); // Use 18 decimals for maximum precision
        const requiredAmountWei = ethers.utils.parseEther(formattedPrice);

        return requiredAmountWei;
    } catch (error) {
        console.error("Error calculating required amount:", error);
        throw error;
    }
}, [network, quantity, nodeFunctions, nodePrices]);

  // Holdings Validation
  const checkAddressHoldings = useCallback(async () => {
    try {
      const holdings = await nodeFunctions.getA6AddressEscrowHoldings(
        network.toLowerCase(),
        activeAddress
      );
      
      const currentQuantity = holdings.totalQty;
      const remainingAllowed = ethers.BigNumber.from(100).sub(currentQuantity);
      
      if (quantity > remainingAllowed) {
        return {
          valid: false,
          currentQuantity: currentQuantity.toString(),
          remainingAllowed: remainingAllowed.toString()
        };
      }

      return {
        valid: true,
        currentQuantity: currentQuantity.toString(),
        remainingAllowed: remainingAllowed.toString()
      };
    } catch (error) {
      console.error("Error checking address holdings:", error);
      throw error;
    }
  }, [network, activeAddress, quantity, nodeFunctions]);

  // Main Process Function
  const processMintInput = useCallback(async () => {
    try {
      // Check Whitelist Status for Flare Network
      if (network.toLowerCase() === 'flare') {
        const whitelistStatus = await checkWhitelistStatus();
        if (whitelistStatus.isEligible) {
          if (whitelistStatus.isPaused) {
            return {
              step: 'notification',
              content: <CountdownTimer />
            };
          }
          return {
            step: 'whitelistMint',
            status: 'ready',
            eligibleQuantity: parseInt(whitelistStatus.quantity.toString())
         };
        }
      }

      // Check if Minting is Paused
      const isPaused = await nodeFunctions.getPaused(network.toLowerCase());
      if (isPaused) {
        return {
          step: 'notification',
          content: <CountdownTimer />
        };
      }

      // Check Price Anomaly
      if (detectPriceAnomaly()) {
        return {
          step: 'error',
          content: "Prices are not fetched. Refresh the page and try again."
        };
      }

        // Add notification HERE - right before starting pre-auth checks
        updateRegNotification({ 
          type: 'mintStart',
          quantity: quantity
      });

      // Validate Holdings
      const holdingsCheck = await checkAddressHoldings();
      if (!holdingsCheck.valid) {
        return {
          step: 'error',
          content: (
            <div className='problem-popup'>
              <h3>MAX_PER_ADDRESS = 100 Nodes</h3>
              <p>Your Current Quantity: {holdingsCheck.currentQuantity}</p>
              <p>Eligible to MINT: {holdingsCheck.remainingAllowed}</p>
              <div className='addr-t' style={{ marginTop: '20px', textAlign: 'center' }}>
                <span className='addr'>Address:</span> {activeAddress ? `${activeAddress.slice(0, 4)}...${activeAddress.slice(-4)}` : 'Not Connected'}
              </div>
            </div>
          )
        };
      }

      // Check Balance
      const nativeBalanceWei = await getNativeBalance();
      const requiredAmountWei = await calculateRequiredAmount();
      const sufficientFunds = ethers.BigNumber.from(nativeBalanceWei).gte(requiredAmountWei);

      // Log Pre-Authorization Details
      console.log('Node Address Pre-Authorization:', {
        Network: network,
        '1) User Address': activeAddress,
        '2) User Balance (WEI)': nativeBalanceWei.toString(),
        '3) Selected Quantity': quantity,
        '4) Required Amount (WEI)': requiredAmountWei.toString(),
        Status: sufficientFunds ? "Address Authorized to MINT" : "insufficient funds"
      });

      // Check if Sufficient Funds
      if (!sufficientFunds) {
        const decimals = network.toLowerCase() === 'ethereum' ? 6 : 2;
        const requiredFormatted = formatNumber(requiredAmountWei, decimals);
        const balanceFormatted = formatNumber(nativeBalanceWei, decimals);
        const tokenSymbol = network.toLowerCase() === 'ethereum' ? 'ETH' : 'FLR';
        return {
          step: 'error',
          content: (
            <div className='problem-popup'>
              <h3>Insufficient balance</h3>
              <p>Required: {requiredFormatted} {tokenSymbol}</p>
              <p>Your balance: {balanceFormatted} {tokenSymbol}</p>
            </div>
          )
        };
      }

      // All Checks Passed
      return {
        step: 'userPreAuthorization',
        status: 'completed',
        selectedQuantity: quantity
      };
    } catch (error) {
      console.error("Error in node minting process:", error);
      return { step: 'error', content: `Error: ${error.message}` };
    }
  }, [
    quantity,
    activeAddress,
    network,
    detectPriceAnomaly,
    getNativeBalance,
    checkWhitelistStatus,
    checkAddressHoldings,
    calculateRequiredAmount,
    nodeFunctions,
    updateRegNotification
  ]);

  // Quantity Input Handlers
  const handleQuantityChange = useCallback((newQuantity) => {
    setQuantity(newQuantity);
  }, []);

  const renderQuantityInput = () => (
    <QuantityInput
      maxQuantity={maxQtyToMint}
      onQuantityChange={handleQuantityChange}
    />
  );

  // Hook Return
  return {
    quantity,
    renderQuantityInput,
    processMintInput,
  };
};

export default useNodeUserMintInput;