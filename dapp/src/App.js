// app.js
import React from 'react';
import Dapp from './Dapp';
import ValidatorDapp from './minerals-validation/validatorDapp';
import NodeDapp from './nodes/nodeDapp';
import PriceFetcher from './core/dummy-fetchers/priceFetcher';
import ReadOnlyFetcher from './core/dummy-fetchers/readOnlyFetcher';
import UserReadOnlyFetcher from './core/dummy-fetchers/userReadOnlyFetcher';
import NodeReadOnlyFetcher from './nodes/nodeReadOnlyFetcher';
import NodeUserReadOnlyFetcher from './nodes/nodeUserReadOnlyFetcher';  // Add this import


function DappFunction({ locationId }) {
  return (
    <div>
      <Dapp locationId={locationId} />
    </div>
  );
}

function ValidatorDappFunction() {
  return (
    <div>
      <ValidatorDapp />
    </div>
  );
}

function NodeDappFunction({ locationId }) {  
  return (
    <div>
      <NodeDapp locationId={locationId} />
    </div>
  );
}

function PriceFetcherFunction() {
  return (
    <div>
      <PriceFetcher />
    </div>
  );
}

function ReadOnlyFetcherFunction() {
  return (
    <div>
      <ReadOnlyFetcher />
    </div>
  );
}

function UserReadOnlyFetcherFunction() {
  return (
    <div>
      <UserReadOnlyFetcher />
    </div>
  );
}

function NodeReadOnlyFetcherFunction() {
  return (
    <div>
      <NodeReadOnlyFetcher />
    </div>
  );
}

function NodeUserReadOnlyFetcherFunction() {  // Add this function
  return (
    <div>
      <NodeUserReadOnlyFetcher />
    </div>
  );
}


export { DappFunction, ValidatorDappFunction, NodeDappFunction, PriceFetcherFunction, ReadOnlyFetcherFunction, UserReadOnlyFetcherFunction, NodeReadOnlyFetcherFunction, NodeUserReadOnlyFetcherFunction
};