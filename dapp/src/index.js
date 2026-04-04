// index.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom/client';
import './index.css';
import { DappFunction, ValidatorDappFunction, NodeDappFunction, PriceFetcherFunction, ReadOnlyFetcherFunction, UserReadOnlyFetcherFunction, NodeReadOnlyFetcherFunction, NodeUserReadOnlyFetcherFunction } from './App';

// COMMENTED OUT - TNO Bronze, Silver, Gold, Diamond sections
// const DappRoot1 = ReactDOM.createRoot(document.getElementById('Dapp1'));
// DappRoot1.render(
//     <DappFunction locationId="Location1" />
// );

// const DappRoot2 = ReactDOM.createRoot(document.getElementById('Dapp2'));
// DappRoot2.render(
//     <DappFunction locationId="Location2" />
// );

// const DappRoot3 = ReactDOM.createRoot(document.getElementById('Dapp3'));
// DappRoot3.render(
//     <DappFunction locationId="Location3" />

// );

// const DappRoot4 = ReactDOM.createRoot(document.getElementById('Dapp4'));
// DappRoot4.render(
//     <DappFunction locationId="Location4" />

// );

const NodeDappRoot5 = ReactDOM.createRoot(document.getElementById('NodeDapp5'));
NodeDappRoot5.render(
    <NodeDappFunction locationId="Location5" /> 
);

// COMMENTED OUT - Minerals Validation section
// const ValidatorDappRoot6 = ReactDOM.createRoot(document.getElementById('ValidatorDapp6'));
// ValidatorDappRoot6.render(
//     <ValidatorDappFunction />
// );


const PriceFetcherRoot0 = ReactDOM.createRoot(document.getElementById('PriceFetcher0'));
PriceFetcherRoot0.render(
    <PriceFetcherFunction />
);

const ReadOnlyFetcherRoot0 = ReactDOM.createRoot(document.getElementById('ReadOnlyFetcher0'));
ReadOnlyFetcherRoot0.render(
    <ReadOnlyFetcherFunction />
);

const UserReadOnlyFetcherRoot0 = ReactDOM.createRoot(document.getElementById('UserReadOnlyFetcher0'));
UserReadOnlyFetcherRoot0.render(
    <UserReadOnlyFetcherFunction />
);

const NodeReadOnlyFetcherRoot0 = ReactDOM.createRoot(document.getElementById('NodeReadOnlyFetcher0'));
NodeReadOnlyFetcherRoot0.render(
    <NodeReadOnlyFetcherFunction />
);

const NodeUserReadOnlyFetcherRoot0 = ReactDOM.createRoot(document.getElementById('NodeUserReadOnlyFetcher0'));
NodeUserReadOnlyFetcherRoot0.render(
    <NodeUserReadOnlyFetcherFunction />
);

