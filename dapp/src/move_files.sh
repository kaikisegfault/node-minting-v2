#!/bin/bash

# Move core files
mv /workspace/devTnoDapp/project/public/react-web3-section/src/contractInteractions.js /workspace/devTnoDapp/project/public/react-web3-section/src/core/
mv /workspace/devTnoDapp/project/public/react-web3-section/src/hooks/read-only-functions/readOnlyFunctions.js /workspace/devTnoDapp/project/public/react-web3-section/src/core/
mv /workspace/devTnoDapp/project/public/react-web3-section/src/hooks/useEventListeners.js /workspace/devTnoDapp/project/public/react-web3-section/src/core/
mv /workspace/devTnoDapp/project/public/react-web3-section/src/hooks/read-only-functions/useReadOnlyState.js /workspace/devTnoDapp/project/public/react-web3-section/src/core/
mv /workspace/devTnoDapp/project/public/react-web3-section/src/hooks/usePrices.js /workspace/devTnoDapp/project/public/react-web3-section/src/core/

# Move dummy fetchers
mv /workspace/devTnoDapp/project/public/react-web3-section/src/smart-components/readOnlyFetcher.js /workspace/devTnoDapp/project/public/react-web3-section/src/core/dummy-fetchers/
mv /workspace/devTnoDapp/project/public/react-web3-section/src/smart-components/PriceFetcher.js /workspace/devTnoDapp/project/public/react-web3-section/src/core/dummy-fetchers/