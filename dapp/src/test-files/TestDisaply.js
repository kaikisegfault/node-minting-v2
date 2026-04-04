import React from 'react';
import { useMainReadOnly } from '../core/useReadOnlyState';

const Terc20SupplyDisplay = () => {
  const { 
    EthAbCurrentChainTerc20SupplyAsTnftResult,
    FlareAbCurrentChainTerc20SupplyAsTnftResult
  } = useMainReadOnly();

  return (
    <div>
      <h2>TERC20 Supply as TNFT</h2>
      <p>Ethereum Chain: {EthAbCurrentChainTerc20SupplyAsTnftResult}</p>
      <p>Flare Chain: {FlareAbCurrentChainTerc20SupplyAsTnftResult}</p>
    </div>
  );
};

export default Terc20SupplyDisplay;