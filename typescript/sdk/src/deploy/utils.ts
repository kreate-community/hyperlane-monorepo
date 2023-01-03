import { Signer, providers } from 'ethers';

import { types } from '@hyperlane-xyz/utils';

import {
  chainConnectionConfigs,
  testChainConnectionConfigs,
} from '../consts/chainConnectionConfigs';
import { MultiProvider } from '../providers/MultiProvider';
import { ChainMap, ChainName, KhalaChainNames, TestChainNames } from '../types';
import { objMap } from '../utils/objects';

import { EnvironmentConfig } from './types';

export function getTestMultiProvider<Chain extends TestChainNames>(
  signerOrProvider: Signer | providers.Provider,
  configs: EnvironmentConfig<Chain> = testChainConnectionConfigs,
): MultiProvider<Chain> {
  let signer: Signer | undefined;
  let provider: providers.Provider;
  if (Signer.isSigner(signerOrProvider) && signerOrProvider.provider) {
    signer = signerOrProvider;
    provider = signerOrProvider.provider;
  } else if (providers.Provider.isProvider(signerOrProvider)) {
    provider = signerOrProvider;
  } else {
    throw new Error('signerOrProvider is invalid');
  }

  const chainProviders = objMap(configs, (_, config) => ({
    signer,
    provider,
    confirmations: config.confirmations,
    overrides: config.overrides,
  }));
  return new MultiProvider(chainProviders);
}

export function getKhalaMultiProvider<Chain extends KhalaChainNames>(
  signerOrProvider: Signer | providers.Provider,
  configs: EnvironmentConfig<Chain> = chainConnectionConfigs,
): MultiProvider<Chain> {
  let signer: Signer | undefined;
  let provider: providers.Provider;
  if (Signer.isSigner(signerOrProvider) && signerOrProvider.provider) {
    signer = signerOrProvider;
    provider = signerOrProvider.provider;
  } else if (providers.Provider.isProvider(signerOrProvider)) {
    provider = signerOrProvider;
  } else {
    throw new Error('signerOrProvider is invalid');
  }

  const chainProviders = objMap(configs, (_, config) => ({
    signer,
    provider,
    confirmations: config.confirmations,
    overrides: config.overrides,
  }));
  return new MultiProvider(chainProviders);
}

export function getChainToOwnerMap<Chain extends ChainName>(
  configMap: ChainMap<Chain, any>,
  owner: types.Address,
): ChainMap<Chain, { owner: string }> {
  return objMap(configMap, () => {
    return {
      owner,
    };
  });
}
