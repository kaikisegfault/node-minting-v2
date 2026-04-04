// useNodeRegMintProcess.js
import { useCallback, useRef } from 'react';
import useNodeApiCommunicator from './useNodeApiCommunicator';
import useNodeQueueManager from './useNodeQueueManager';
import useNodeRegWeb3Injection from './useNodeRegWeb3Injection';
import useWalletConnection from '../../../core/useWalletConnection';

const useNodeRegMintProcess = (updateNotification) => {
    const apiCommunicator = useNodeApiCommunicator();
    const queueManager = useNodeQueueManager();
    const { injectRegularMint } = useNodeRegWeb3Injection();
    const { network, activeAddress } = useWalletConnection();
    const pollIntervalRef = useRef(null);
    const isProcessingRef = useRef(false);

    // useNodeRegMintProcess.js
    const handleMintProcess = useCallback(async (processedData, mintRequest) => {
        if (isProcessingRef.current) {
            return;
        }

        try {
            isProcessingRef.current = true;

            // Clear any existing polling
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }

            updateNotification({
                type: 'queueUpdate',
                queueData: {
                    ...processedData,
                    status: 'waiting-user-confirmation'
                }
            });

            const mintParams = {
                value: processedData.mintData.value,
                otherChainQty: processedData.mintData.otherChainQty,
                mintAmount: processedData.mintData.mintAmount,
                timestamp: processedData.mintData.timestamp,
                randomNonce: mintRequest.randomNonce,
                signature: processedData.mintData.signature
            };

            let transaction, waitForReceipt;
            try {
                ({ transaction, waitForReceipt } = await injectRegularMint(mintParams));
            } catch (injectionError) {
                // Handle user rejection (code 4001) - this now includes hardware wallet rejections
                if (injectionError.code === 4001 || injectionError.message.includes('user rejected transaction')) {
                    console.log('User cancelled the transaction');
                    await apiCommunicator.communicateWithApi({
                        ...mintRequest,
                        status: 'rejected'
                    });
                    updateNotification({ type: null });
                    return;
                }
                
                // Handle hardware wallet specific errors - don't mark as failed, let user retry
                if (injectionError.code === 'HARDWARE_WALLET_ERROR') {
                    console.log('Hardware wallet error:', injectionError.message);
                    await apiCommunicator.communicateWithApi({
                        ...mintRequest,
                        status: 'rejected' // Use rejected instead of failed for hardware wallet issues
                    });
                    updateNotification({ 
                        type: 'error', 
                        content: injectionError.message 
                    });
                    return;
                }
                
                throw injectionError;
            }

// After successful transaction initiation
console.log('Transaction hash:', transaction.hash);

            // Send API update
            await apiCommunicator.communicateWithApi({
                ...mintRequest,
                status: 'waiting-receipt'
            });

            // Update notification with processed entries
            const updatedQueueData = {
                ...processedData,
                entries: processedData.entries.map(entry => ({
                    ...entry,
                    status: entry.isUserAddress ? 'waiting-receipt' : entry.status
                }))
            };

            updateNotification({
                type: 'queueUpdate',
                queueData: updatedQueueData
            });

            const receipt = await waitForReceipt();
            console.log('Transaction receipt:', receipt);

            await apiCommunicator.communicateWithApi({
                ...mintRequest,
                status: 'minted'
            });

            const truncatedAddress = `${activeAddress.slice(0, 4)}...${activeAddress.slice(-4)}`;
            const nodeText = mintRequest.mintAmount > 1 ? 'Nodes' : 'Node';
            const message = `${mintRequest.mintAmount} ${nodeText} successfully MINTED on ${network} by ${truncatedAddress}`;
            updateNotification({ 
                type: 'success', 
                content: message 
            });

        } catch (error) {
            console.error('Mint process error:', error);
            try {
                await apiCommunicator.communicateWithApi({
                    ...mintRequest,
                    status: 'failed'
                });
            } catch (apiError) {
                console.error('Failed to update status:', apiError);
            }
            
            // Provide more specific error messages based on error type
            let errorMessage = 'Transaction failed';
            const errorStr = (error.message || '').toLowerCase();
            
            if (errorStr.includes('timeout') || errorStr.includes('expired')) {
                errorMessage = 'Transaction failed (signature expired). Please try again.';
            } else if (errorStr.includes('insufficient') || errorStr.includes('funds')) {
                errorMessage = 'Transaction failed: Insufficient funds';
            } else if (errorStr.includes('nonce')) {
                errorMessage = 'Transaction failed: Nonce error. Please refresh and try again.';
            } else if (errorStr.includes('gas')) {
                errorMessage = 'Transaction failed: Gas estimation error. Please try again.';
            } else if (errorStr.includes('network') || errorStr.includes('connection')) {
                errorMessage = 'Transaction failed: Network error. Please check your connection and try again.';
            } else {
                errorMessage = `Transaction failed: ${error.message || 'Unknown error'}`;
            }
            
            updateNotification({ 
                type: 'error', 
                content: errorMessage
            });
        } finally {
            isProcessingRef.current = false;
        }
    }, [apiCommunicator, injectRegularMint, updateNotification, network, activeAddress]);

    const startQueuePolling = useCallback(async (mintRequest) => {
        // Clear any existing interval
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }

        const pollQueue = async () => {
            if (isProcessingRef.current) {
                return;
            }

            try {
                const apiResponse = await apiCommunicator.communicateWithApi(mintRequest, true);
                
                if (!apiResponse.success) {
                    throw new Error(apiResponse.error);
                }

                const processedQueue = queueManager.processQueueData(apiResponse, mintRequest.address);
                if (!processedQueue.success) {
                    throw new Error('Failed to process queue data');
                }

                updateNotification({
                    type: 'queueUpdate',
                    queueData: processedQueue.data
                });

                if (processedQueue.data.type === 'fullResponse' && processedQueue.data.mintData) {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                    await handleMintProcess(processedQueue.data, mintRequest);
                }
            } catch (error) {
                console.error('Queue polling error:', error);
            }
        };

        pollIntervalRef.current = setInterval(pollQueue, 1000);
    }, [apiCommunicator, queueManager, updateNotification, handleMintProcess]);

    const executeRegularMint = useCallback(async ({ quantity, address, network }) => {
        try {
            // Clear tracked addresses before starting new mint
            queueManager.clearTrackedNonces();  // We'll add this method
    
            updateNotification({ 
                type: 'mintStart',
                quantity: quantity
            });

            const mintRequest = {
                address: address,
                mintAmount: quantity,
                network: network,
                randomNonce: apiCommunicator.generateRandomNonce()
            };

            const initialResponse = await apiCommunicator.communicateWithApi(mintRequest);
            
            if (!initialResponse.success) {
                throw new Error(initialResponse.error);
            }

            const initialProcessedQueue = queueManager.processQueueData(initialResponse, address);
            if (!initialProcessedQueue.success) {
                throw new Error('Failed to process queue data');
            }

            updateNotification({
                type: 'queueUpdate',
                queueData: initialProcessedQueue.data
            });

            if (initialProcessedQueue.data.type !== 'fullResponse' || !initialProcessedQueue.data.mintData) {
                await startQueuePolling(mintRequest);
            } else {
                await handleMintProcess(initialProcessedQueue.data, mintRequest);
            }

            return initialProcessedQueue.data;

        } catch (error) {
            console.error('Regular mint process error:', error);
            updateNotification({ 
                type: 'error', 
                content: `Regular mint process error: ${error.message}`
            });
            throw error;
        }
    }, [apiCommunicator, queueManager, updateNotification, startQueuePolling, handleMintProcess]);

    return {
        executeRegularMint
    };
};

export default useNodeRegMintProcess;