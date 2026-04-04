import { useCallback, useRef } from 'react';

const API_URL = 'https://are21gn8z7.execute-api.us-east-1.amazonaws.com/v1';

// useNodeApiCommunicator.js
const useNodeApiCommunicator = () => {
    // Add ref to store previous queue data for comparison
    // eslint-disable-next-line
    const prevQueueDataRef = useRef(null);

    const generateRandomNonce = useCallback(() => {
        const nonce = Math.floor(Math.random() * 1000000000000000000).toString();
        return nonce.padStart(18, '0');
    }, []);
    // eslint-disable-next-line
    const hasQueueChanged = (newQueue, prevQueue) => {
        if (!prevQueue) return true;
        
        // Compare relevant properties that indicate a change
        return JSON.stringify(newQueue.map(item => ({
            address: item.address,
            status: item.status,
            concluded: item.concluded,
            queuePosition: item.queuePosition
        }))) !== JSON.stringify(prevQueue.map(item => ({
            address: item.address,
            status: item.status,
            concluded: item.concluded,
            queuePosition: item.queuePosition
        })));
    };

    const communicateWithApi = useCallback(async (requestData, isPolling = false) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                body: JSON.stringify(requestData)
            });
    
            const data = await response.json();
    
            // Only log if it's not a polling request or if it's a status update
            if (!isPolling) {
                if (requestData.status) {
                    console.log('Status Update Sent:', requestData);
                } else {
                    console.log('MINT request sent:', requestData);
                }
                console.log('Raw API response:', data);
            }
    
            // Special handling for 409 Conflict
            if (response.status === 409) {
                console.log('Queue entry conflict:', data);
                return {
                    success: false,
                    error: 'Queue entry expired or not found',
                    data: data
                };
            }
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(data)}`);
            }
    
            return {
                success: true,
                data: data
            };
    
        } catch (error) {
            console.error('Error communicating with Node API:', error);
            return {
                success: false,
                error: error.message || 'An error occurred while communicating with the API'
            };
        }
    }, []);

    return {
        generateRandomNonce,
        communicateWithApi
    };
};

export default useNodeApiCommunicator;