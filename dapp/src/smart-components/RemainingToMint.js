import React from 'react';
import ProgressBar from '../ui-components/ProgressBar';
import { useMainReadOnly } from '../core/useReadOnlyState';

const RemainingToMint = () => {
    const {
        EthAbCurrentChainTerc20SupplyAsTnftResult,
        FlareAbCurrentChainTerc20SupplyAsTnftResult
    } = useMainReadOnly();

    const MAX_SUPPLY = 771000000; // 771,000,000 $EXPL

    // Calculate the total minted amount
    const totalMinted = EthAbCurrentChainTerc20SupplyAsTnftResult + FlareAbCurrentChainTerc20SupplyAsTnftResult;

    // Calculate the remaining amount to mint
    const remainingToMint = Math.max(MAX_SUPPLY - totalMinted, 0);

    return (
        <div className="remaining-to-mint-container animate-element delay5 fadeInDown" >
            <ProgressBar header="Remaining to MINT"
                afterZeroHeader="SOLD OUT!"
                loadingHeader="TNO MAX SUPPLY"
                maxQty={MAX_SUPPLY}
                remaining={remainingToMint}
                unit="$EXPL"
                maxQtyDescription="(TNO allocation)" />
        </div>
    );
};

export default RemainingToMint;