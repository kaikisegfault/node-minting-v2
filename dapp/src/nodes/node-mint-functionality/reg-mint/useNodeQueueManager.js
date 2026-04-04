import { useCallback, useRef } from 'react';

const useNodeQueueManager = () => {
    // Change from addresses to nonces
    const activeNoncesRef = useRef(new Set());
    const initialOrderRef = useRef(new Map());

    const formatAddress = (address) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    const getPositionLabel = (position) => {
        if (position === 'concluded') return '✓';
        return `${position}:`;
    };

    const clearTrackedNonces = useCallback(() => {
        activeNoncesRef.current.clear();
        initialOrderRef.current.clear();
    }, []);

    const processQueueData = useCallback((apiResponse, requestAddress) => {
        if (!apiResponse?.data?.queueData) {
            return {
                success: false,
                error: 'Invalid queue data'
            };
        }

        const { queueData, mintData } = apiResponse.data;

        // If this is initial load (no tracked nonces yet)
        if (activeNoncesRef.current.size === 0) {
            // Get and store initial active entries (reversed order)
            const initialActiveEntries = queueData
                .filter(entry => !entry.concluded)
                .sort((a, b) => parseInt(b.queuePosition) - parseInt(a.queuePosition));
    
            // Store nonces and their initial order (in reversed order)
            initialActiveEntries.forEach((entry, index) => {
                activeNoncesRef.current.add(entry.randomNonce);
                initialOrderRef.current.set(entry.randomNonce, initialActiveEntries.length - 1 - index);
            });
    
            // Process initial entries (already in reverse order)
            const processedEntries = initialActiveEntries.map(entry => ({
                position: getPositionLabel(entry.queuePosition),
                address: formatAddress(entry.address),
                quantity: entry.quantity,
                status: entry.status === 'inQueue' && entry.address === requestAddress ? 
                    'Your Address' : entry.status,
                isConcluded: entry.concluded,
                expiryTimestamp: entry.expiryTimestamp,
                isFirst: entry.queuePosition === '1',
                randomNonce: entry.randomNonce,
                isUserAddress: entry.address === requestAddress,
                initialOrder: initialOrderRef.current.get(entry.randomNonce)
            }));
    
            return {
                success: true,
                data: {
                    entries: processedEntries,
                    mintData: mintData,
                    type: mintData ? 'fullResponse' : 'queueOnly'
                }
            };
        }
    
        // For subsequent updates, show all entries for tracked nonces
        const processedEntries = queueData
            .filter(entry => activeNoncesRef.current.has(entry.randomNonce))
            .map(entry => ({
                position: getPositionLabel(entry.queuePosition),
                address: formatAddress(entry.address),
                quantity: entry.quantity,
                status: entry.status === 'inQueue' && entry.address === requestAddress ? 
                    'Your Address' : entry.status,
                isConcluded: entry.concluded,
                expiryTimestamp: entry.expiryTimestamp,
                isFirst: entry.queuePosition === '1',
                randomNonce: entry.randomNonce,
                isUserAddress: entry.address === requestAddress,
                initialOrder: initialOrderRef.current.get(entry.randomNonce)
            }))
            .sort((a, b) => b.initialOrder - a.initialOrder);
    
        return {
            success: true,
            data: {
                entries: processedEntries,
                mintData: mintData,
                type: mintData ? 'fullResponse' : 'queueOnly'
            }
        };
    }, []);

    return {
        processQueueData,
        clearTrackedNonces  // Renamed from clearTrackedAddresses
    };
};

export default useNodeQueueManager;