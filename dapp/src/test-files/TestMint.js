import React from 'react';
import useUserMintInput from '../core/user-interactions/useUserMintInput';

const createTestMint = (locationId) => {
  return () => {
    const {
      renderQuantityInput,
      processMintInput
    } = useUserMintInput(locationId);

    return (
      <div id={locationId}>
        {renderQuantityInput()}
        <button onClick={processMintInput}>MINT</button>
      </div>
    );
  };
};

// versions
const TestMint1 = createTestMint('Location1');
const TestMint2 = createTestMint('Location2');
const TestMint3 = createTestMint('Location3');
const TestMint4 = createTestMint('Location4');

// passed ID
const TestMint = ({ id }) => {
  if (id === 'Location1') return <TestMint1 />;
  if (id === 'Location2') return <TestMint2 />;
  if (id === 'Location3') return <TestMint3 />;
  if (id === 'Location4') return <TestMint4 />;
  // No default case
};

export default TestMint;