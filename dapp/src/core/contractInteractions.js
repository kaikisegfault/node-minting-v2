import { NodeEthereumInteraction, destroyEthereumConnection } from './EthereumInteraction';
import { NodeFlareInteraction, destroyFlareConnection } from './FlareInteraction';
import { FlarePriceInteraction } from './FlarePriceInteraction';
import { NodeBSCInteraction, destroyBSCConnection } from './BinanceInteraction';

export {
  NodeEthereumInteraction,
  NodeFlareInteraction,
  NodeBSCInteraction,
  FlarePriceInteraction,
  destroyEthereumConnection,
  destroyFlareConnection,
  destroyBSCConnection
};

// ARCHIVED: TNO and Minerals contract interactions
// import { EthereumInteraction } from './EthereumInteraction';
// import { FlareInteraction, MineralsInteraction } from './FlareInteraction';
// export { EthereumInteraction, FlareInteraction, MineralsInteraction };
