// import { Router__factory, TestRouter__factory } from '@hyperlane-xyz/core';
import { TestRouter__factory } from '@hyperlane-xyz/core';

import { HyperlaneApp } from '../../HyperlaneApp';
import { chainConnectionConfigs } from '../../consts/chainConnectionConfigs';
import { HyperlaneCore } from '../../core/HyperlaneCore';
import { HyperlaneDeployer } from '../../deploy/HyperlaneDeployer';
import { HyperlaneRouterChecker } from '../../deploy/router/HyperlaneRouterChecker';
import { HyperlaneRouterDeployer } from '../../deploy/router/HyperlaneRouterDeployer';
import { RouterConfig } from '../../deploy/router/types';
import { MultiProvider } from '../../providers/MultiProvider';
import { RouterContracts, RouterFactories } from '../../router';
import { ChainMap, ChainName } from '../../types';
import { objMap, promiseObjAll } from '../../utils/objects';

export const fullEnvTestConfigs = {
  test1: chainConnectionConfigs.test1,
  test2: chainConnectionConfigs.test2,
  test3: chainConnectionConfigs.test3,
  khala: chainConnectionConfigs.khala,
  goerli: chainConnectionConfigs.goerli,
};

export const fullEnvConfigs = {
  khala: chainConnectionConfigs.khala,
  goerli: chainConnectionConfigs.goerli,
};

export const subsetTestConfigs = {
  test1: chainConnectionConfigs.test1,
  test2: chainConnectionConfigs.test2,
};

export const subsetKhalaConfigs = {
  khala: chainConnectionConfigs.khala,
  goerli: chainConnectionConfigs.goerli,
};

export type SubsetChains = keyof typeof subsetTestConfigs;

export type KhalaSubsetChains = keyof typeof subsetKhalaConfigs;

export const alfajoresChainConfig = {
  alfajores: chainConnectionConfigs.alfajores,
};

export class EnvSubsetApp<
  Chain extends ChainName = ChainName,
> extends HyperlaneApp<RouterContracts, Chain> {}

export class EnvSubsetChecker<
  Chain extends ChainName,
> extends HyperlaneRouterChecker<
  Chain,
  EnvSubsetApp<Chain>,
  RouterConfig,
  RouterContracts
> {}

export const envSubsetFactories: RouterFactories = {
  router: new TestRouter__factory(),
  // router: new Router__factory(),
};

export class EnvSubsetDeployer<
  Chain extends ChainName,
> extends HyperlaneRouterDeployer<
  Chain,
  RouterConfig,
  RouterContracts,
  RouterFactories
> {
  constructor(
    multiProvider: MultiProvider<Chain>,
    configMap: ChainMap<Chain, RouterConfig>,
    protected core: HyperlaneCore<Chain>,
  ) {
    super(multiProvider, configMap, envSubsetFactories, {});
  }

  // Consider moving this up to HyperlaneRouterDeployer
  async initRouter(
    contractsMap: ChainMap<Chain, RouterContracts>,
  ): Promise<void> {
    this.logger(`Calling initialize on routers...`);
    await promiseObjAll(
      objMap(contractsMap, async (chain, contracts) => {
        const chainConnection = this.multiProvider.getChainConnection(chain);
        const mailbox = this.configMap[chain].mailbox;
        await chainConnection.handleTx(
          // @ts-ignore
          contracts.router.initialize(mailbox, chainConnection.overrides),
        );
      }),
    );
  }

  async deploy(): Promise<ChainMap<Chain, RouterContracts>> {
    const contractsMap = (await HyperlaneDeployer.prototype.deploy.apply(
      this,
    )) as Record<Chain, RouterContracts>;
    await this.initRouter(contractsMap);
    await this.enrollRemoteRouters(contractsMap);
    return contractsMap;
  }

  async deployContracts(chain: Chain) {
    const router = await this.deployContract(chain, 'router', []);
    return {
      router,
    };
  }
}
