import React from 'react';
import MineralsProgressBar from './MineralsProgressBar';
import { useMainReadOnly } from '../core/useReadOnlyState';

const RemainingMineralsToValidate = () => {
    const {
        getMineralsGeneralInfoResults
    } = useMainReadOnly();

    const MAX_MINERALS = 1200;

    // Determine loading state from data availability
    const isLoading = !getMineralsGeneralInfoResults;

    return (
        <div className="remaining-to-mint-container animate-element delay5 fadeInDown" >
            <MineralsProgressBar 
                header="Validated Blue Minerals"
                completedHeader="ALL MINERALS VALIDATED!"
                loadingHeader="TOTAL MINERALS TO VALIDATE"
                maxQty={MAX_MINERALS}
                validated={getMineralsGeneralInfoResults?.validatedMineralsQty || 0}
                unit=""
                maxQtyDescription="(Total Validate Spots)"
                isLoading={isLoading} />
        </div>
    );
};

export default RemainingMineralsToValidate;