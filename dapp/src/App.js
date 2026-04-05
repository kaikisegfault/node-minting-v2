// app.js
import React from 'react';
import NodeDapp from './nodes/nodeDapp';
import PriceFetcher from './core/dummy-fetchers/priceFetcher';
import NodeReadOnlyFetcher from './nodes/nodeReadOnlyFetcher';
import NodeUserReadOnlyFetcher from './nodes/nodeUserReadOnlyFetcher';

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

function NodeReadOnlyFetcherFunction() {
  return (
    <div>
      <NodeReadOnlyFetcher />
    </div>
  );
}

function NodeUserReadOnlyFetcherFunction() {
  return (
    <div>
      <NodeUserReadOnlyFetcher />
    </div>
  );
}

export { NodeDappFunction, PriceFetcherFunction, NodeReadOnlyFetcherFunction, NodeUserReadOnlyFetcherFunction };

// ARCHIVED: TNO and Minerals components
// import Dapp from './Dapp';
// import ValidatorDapp from './minerals-validation/validatorDapp';
// import ReadOnlyFetcher from './core/dummy-fetchers/readOnlyFetcher';
// import UserReadOnlyFetcher from './core/dummy-fetchers/userReadOnlyFetcher';
// export { DappFunction, ValidatorDappFunction, ReadOnlyFetcherFunction, UserReadOnlyFetcherFunction };
