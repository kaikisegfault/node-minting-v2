import { useCallback } from 'react';

const API_URL = 'https://yl2wwlf7f0.execute-api.us-east-1.amazonaws.com/dev/generate-signature';

const useApiCommunicator = () => {
    const generateRandomNonce = useCallback(() => {
        const nonce = Math.floor(Math.random() * 1000000000000000000).toString();
        return nonce.padStart(18, '0');
      }, []);

    const communicateWithApi = useCallback(async (requestData) => {
        try {
        console.log('Sending request');
    
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          });
    
        const data = await response.json();
        console.log('Received response');
    
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(data)}`);
        }
    
        return {
            success: true,
            data: data,
        };
  } catch (error) {
    console.error('Error communicating with API:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while communicating with the API',
    };
  }
}, []);

  return {
    generateRandomNonce,
    communicateWithApi,
  };
};

export default useApiCommunicator;