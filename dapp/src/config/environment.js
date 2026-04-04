/**
 * Domain-based environment configuration.
 * Detects staging vs production based on hostname.
 */

const getEnvironment = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'development';
  if (hostname.includes('staging')) return 'staging';
  return 'production';
};

const ENV = getEnvironment();

const CONFIGS = {
  production: {
    nodeAPI: 'https://are21gn8z7.execute-api.us-east-1.amazonaws.com/v1',
    contracts: {
      node: '0x468F1F91fc674e0161533363B13c2ccBE3769981',
      tno: process.env.REACT_APP_CONTRACT_ADDRESS,
      minerals: process.env.REACT_APP_MINERALS_VALIDATOR_CONTRACT,
    },
    providers: {
      ethereum: {
        websocket: 'wss://eth-mainnet.g.alchemy.com/v2/BARDUqmrhPMi8Xl2hIMOHYL72cMd2a_5',
        chainId: '0x1',
      },
      flare: {
        websocket: 'wss://flare-api.flare.network/ext/bc/C/ws',
        rpc: 'https://flare-api.flare.network/ext/bc/C/rpc',
        chainId: '0xe',
      },
      bsc: {
        websocket: 'wss://bsc-rpc.publicnode.com',
        rpc: 'https://bsc-dataseed.binance.org/',
        chainId: '0x38',
      },
    },
    priceOracle: {
      rpc: 'https://flare-api.flare.network/ext/bc/C/rpc',
      contract: '0xB18d3A5e5A85C65cE47f977D7F486B79F99D3d32',
    },
  },
  staging: {
    nodeAPI: 'https://xo3gv7qvs4.execute-api.us-east-1.amazonaws.com/v1',
    contracts: {
      node: '0x62aF9742854301c6a47f894df095bDA2C2A1248C',
      nodeBsc: '0x68EadEd52585B32d5cDa182e7de9439196994EC8',
      tno: process.env.REACT_APP_CONTRACT_ADDRESS,
      minerals: process.env.REACT_APP_MINERALS_VALIDATOR_CONTRACT,
    },
    providers: {
      ethereum: {
        websocket: 'wss://ethereum-sepolia-rpc.publicnode.com',
        rpc: 'https://ethereum-sepolia-rpc.publicnode.com',
        chainId: '0xaa36a7',
      },
      flare: {
        websocket: 'wss://flare-api.flare.network/ext/bc/C/ws',
        rpc: 'https://flare-api.flare.network/ext/bc/C/rpc',
        chainId: '0xe',
      },
      bsc: {
        rpc: 'https://bsc-testnet.bnbchain.org',
        chainId: '0x61',
      },
    },
    priceOracle: {
      rpc: 'https://flare-api.flare.network/ext/bc/C/rpc',
      contract: '0xB18d3A5e5A85C65cE47f977D7F486B79F99D3d32',
    },
  },
  development: {
    nodeAPI: 'http://localhost:3001',
    contracts: {
      node: process.env.REACT_APP_LOCAL_ETH_CONTRACT || '0x468F1F91fc674e0161533363B13c2ccBE3769981',
      tno: process.env.REACT_APP_CONTRACT_ADDRESS,
      minerals: process.env.REACT_APP_MINERALS_VALIDATOR_CONTRACT,
    },
    providers: {
      ethereum: {
        websocket: `wss://eth-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`,
        chainId: '0x1',
      },
      flare: {
        websocket: process.env.REACT_APP_FLARE_WEBSOCKET || 'wss://flare-api.flare.network/ext/bc/C/ws',
        rpc: 'https://flare-api.flare.network/ext/bc/C/rpc',
        chainId: '0xe',
      },
      bsc: {
        websocket: 'wss://bsc-rpc.publicnode.com',
        rpc: 'https://bsc-dataseed.binance.org/',
        chainId: '0x38',
      },
    },
    priceOracle: {
      rpc: 'https://flare-api.flare.network/ext/bc/C/rpc',
      contract: '0xB18d3A5e5A85C65cE47f977D7F486B79F99D3d32',
    },
  },
};

export const CONFIG = CONFIGS[ENV];
export const ENVIRONMENT = ENV;

export const getNodeContractAddress = (network) => {
  if (ENV === 'staging' && network === 'Binance') {
    return CONFIG.contracts.nodeBsc;
  }
  return CONFIG.contracts.node;
};

export const getChainConfig = (network) => {
  switch (network) {
    case 'Ethereum': return CONFIG.providers.ethereum;
    case 'Flare': return CONFIG.providers.flare;
    case 'Binance': return CONFIG.providers.bsc;
    default: return CONFIG.providers.ethereum;
  }
};
