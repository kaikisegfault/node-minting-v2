import { ethers } from 'ethers';
import React, { useCallback, useState } from 'react';
import { useReadOnlyFunctions } from '../readOnlyFunctions';
import useWalletConnection from '../useWalletConnection';
import usePrices from '../usePrices';
import QuantityInput from '../../ui-components/QuantityInput';

const useUserMintInput = (locationId) => {
  const { network, activeAddress } = useWalletConnection();
  const prices = usePrices();
  const [quantity, setQuantity] = useState(1);
  const maxQtyToMint = 10;
  const { getPauseState, getNativeBalance } = useReadOnlyFunctions();

  const formatNumber = (value, decimals) => {
    const parts = ethers.utils.formatEther(value).split('.');
    const integerPart = parseInt(parts[0]).toLocaleString();
    const decimalPart = parts[1] ? parts[1].slice(0, decimals) : '0'.repeat(decimals);
    return `${integerPart}.${decimalPart}`;
  };

  const getNftId = useCallback((locId) => {
    const idMap = { Location1: 1, Location2: 2, Location3: 3, Location4: 4 };
    return idMap[locId] || 1;
  }, []);

  const getNftPrice = useCallback((nftId) => {
    const nftType = ['bronze', 'silver', 'gold', 'diamond'][nftId - 1];
    const networkSuffix = network.toLowerCase() === 'ethereum' ? 'ETH' : 'FLR';
    const priceKey = `${nftType}Price${networkSuffix}`;
    return prices[priceKey] || 0;
  }, [network, prices]);

  const detectPriceAnomaly = useCallback(() => {
    const ethUsdPrice = prices.ethUsd;
    const flrUsdPrice = prices.flrUsd;

    if (network.toLowerCase() === 'ethereum' && ethUsdPrice <= 0) {
      return true;
    }
    if (network.toLowerCase() === 'flare' && flrUsdPrice <= 0) {
      return true;
    }
    return false;
  }, [network, prices]);

  const processMintInput = useCallback(async () => {
    try {
      const flarePaused = await getPauseState('flare');
      const ethPaused = await getPauseState('ethereum');

      console.log(`Flare Pause: ${flarePaused}`);
      console.log(`Eth Pause: ${ethPaused}`);

      if (flarePaused || ethPaused) {
        return { step: 'error', content: "TNO is going live soon..." };
      }

      if (detectPriceAnomaly()) {
        console.log("Prices are not fetched during MINTING");
        return { step: 'error', content: "Prices are not fetched. Refresh the page and try again." };
      }

      const nftId = getNftId(locationId);
      
      const nativeBalanceWei = await getNativeBalance(network.toLowerCase(), activeAddress);
      
      const nftPriceEth = getNftPrice(nftId);
      const nftPriceWei = ethers.utils.parseEther(nftPriceEth.toString());
      const requiredAmountWei = nftPriceWei.mul(ethers.BigNumber.from(quantity));
      const sufficientFunds = ethers.BigNumber.from(nativeBalanceWei).gte(requiredAmountWei);

      const result = {
        userAddress: activeAddress,
        nativeBalanceWei: nativeBalanceWei.toString(),
        selectedId: nftId,
        selectedQuantity: quantity,
        requiredAmountWei: requiredAmountWei.toString(),
        status: sufficientFunds ? "Address Authorized to MINT" : "insufficient funds"
      };

      console.log('Address Pre-Authorization:', {
        Network: network,
        '1) User Address': activeAddress,
        '2) User Balance (WEI)': result.nativeBalanceWei,
        '3) Selected ID': result.selectedId,
        '4) Selected Quantity': result.selectedQuantity,
        '5) Required Amount (WEI)': result.requiredAmountWei,
        Status: result.status
      });

      if (!sufficientFunds) {
        const decimals = network.toLowerCase() === 'ethereum' ? 4 : 2;
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

      return { 
        step: 'userPreAuthorization', 
        status: 'completed',
        selectedId: nftId,
        selectedQuantity: quantity
      };
    } catch (error) {
      console.error("Error in minting process:", error);
      return { step: 'error', content: `Error: ${error.message}` };
    }
  }, [locationId, quantity, activeAddress, network, getNftId, getNativeBalance, getNftPrice, detectPriceAnomaly, getPauseState]);

  const handleQuantityChange = useCallback((newQuantity) => {
    setQuantity(newQuantity);
  }, []);

  const renderQuantityInput = () => (
    <QuantityInput
      maxQuantity={maxQtyToMint}
      onQuantityChange={handleQuantityChange}
    />
  );

  return {
    quantity,
    renderQuantityInput,
    processMintInput,
  };
};

export default useUserMintInput;