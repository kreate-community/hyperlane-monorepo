import { HelloWorldConfig } from '../../../src/config';
import { ConnectionType } from '../../../src/config/agent';
import { HelloWorldKathyRunMode } from '../../../src/config/helloworld';
import { Contexts } from '../../contexts';

import { MainnetChains, environment } from './chains';
import hyperlaneAddresses from './helloworld/hyperlane/addresses.json';

export const hyperlane: HelloWorldConfig<MainnetChains> = {
  addresses: hyperlaneAddresses,
  kathy: {
    docker: {
      repo: 'gcr.io/abacus-labs-dev/hyperlane-monorepo',
      // TODO: Use an image built off of main
      tag: 'sha-507557e',
    },
    chainsToSkip: [],
    runEnv: environment,
    namespace: environment,
    runConfig: {
      mode: HelloWorldKathyRunMode.Service,
      fullCycleTime: 1000 * 60 * 60 * 6, // every 6 hours
    },
    messageSendTimeout: 1000 * 60 * 8, // 8 min
    messageReceiptTimeout: 1000 * 60 * 20, // 20 min
    connectionType: ConnectionType.Http,
    cyclesBetweenEthereumMessages: 3, // Skip 3 cycles of Ethereum, i.e. send/receive Ethereum messages once a day.
  },
};

export const helloWorld: Partial<
  Record<Contexts, HelloWorldConfig<MainnetChains>>
> = {
  [Contexts.Hyperlane]: hyperlane,
};
