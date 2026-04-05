// index.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom/client';
import './index.css';
import { NodeDappFunction, PriceFetcherFunction, NodeReadOnlyFetcherFunction, NodeUserReadOnlyFetcherFunction } from './App';

// NODES
const NodeDappRoot5 = ReactDOM.createRoot(document.getElementById('NodeDapp5'));
NodeDappRoot5.render(
    <NodeDappFunction locationId="Location5" />
);

// SHARED: Price fetcher (Flare FTSO - FLR, ETH, BNB)
const PriceFetcherRoot0 = ReactDOM.createRoot(document.getElementById('PriceFetcher0'));
PriceFetcherRoot0.render(
    <PriceFetcherFunction />
);

// NODE supply + user holdings fetchers
const NodeReadOnlyFetcherRoot0 = ReactDOM.createRoot(document.getElementById('NodeReadOnlyFetcher0'));
NodeReadOnlyFetcherRoot0.render(
    <NodeReadOnlyFetcherFunction />
);

const NodeUserReadOnlyFetcherRoot0 = ReactDOM.createRoot(document.getElementById('NodeUserReadOnlyFetcher0'));
NodeUserReadOnlyFetcherRoot0.render(
    <NodeUserReadOnlyFetcherFunction />
);

// ARCHIVED: TNO (DappFunction) and Minerals (ValidatorDappFunction)
// Commented out — these contracts are no longer active.
// TNO ReadOnlyFetcher and UserReadOnlyFetcher also removed
// to prevent console errors from null contract interactions.
