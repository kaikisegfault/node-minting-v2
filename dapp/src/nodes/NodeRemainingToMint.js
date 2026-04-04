// NodeRemainingToMint.js
import React from 'react';
import NodeProgressBar from './NodeProgressBar';
import { useNodeReadOnly } from './useNodeReadOnlyState';
import { useNodePrices } from './useNodePrices';
import { Spinner } from 'react-bootstrap';

const NodeRemainingToMint = () => {
    const {
        totalSupply,
        FlareWhitelistMintedCountResults
    } = useNodeReadOnly();

    const {
        remainingNodesInThisTier,
        currentNodePriceUSD
    } = useNodePrices();

    const MAX_SUPPLY = 12000;
    const TIER_SIZE = 100;
    
    // Use the pre-calculated total minted nodes from state
    const totalMinted = totalSupply;
    
    // Calculate regular minted (total supply minus whitelist)
    const regularMinted = totalSupply - FlareWhitelistMintedCountResults;
    
    // Whitelist minted is directly from state
    const whitelistMinted = FlareWhitelistMintedCountResults;
    
    // Calculate total remaining nodes
    const totalRemaining = Math.max(MAX_SUPPLY - totalMinted, 0);

    // Check if values meet the minimum thresholds
    const isLoadingPrice = currentNodePriceUSD < 6;
    const isLoadingTotal = totalMinted < 1526;

    // Create spinner component for consistent styling
    const LoadingSpinner = () => (
        <Spinner animation="grow" variant="secondary" size="sm" />
    );

    // Create the header as a React element instead of a template string
    const headerContent = (
        <>
            Remaining Nodes / Tier: {isLoadingPrice ? <LoadingSpinner /> : currentNodePriceUSD} USD
        </>
    );

    // Format the total minted count with spinner if needed
    const formattedTotalMinted = isLoadingTotal ? 0 : totalMinted;
    const formattedRegularMinted = isLoadingTotal ? 0 : regularMinted;
    const formattedWhitelistMinted = isLoadingTotal ? 0 : whitelistMinted;

    return (
        <div className="remaining-to-mint-container animate-element delay5 fadeInDown">
            <NodeProgressBar 
                header={headerContent}
                afterZeroHeader="NEXT TIER!"
                loadingHeader="NODE MAX SUPPLY"
                maxQty={TIER_SIZE}
                remaining={remainingNodesInThisTier}
                unit=""
                maxQtyDescription="MAX SUPPLY:"
                totalRemaining={totalRemaining}
                totalMinted={formattedTotalMinted}
                regularMinted={formattedRegularMinted}
                whitelistMinted={formattedWhitelistMinted}
                isLoadingTotal={isLoadingTotal}
            />
        </div>
    );
};

export default NodeRemainingToMint;