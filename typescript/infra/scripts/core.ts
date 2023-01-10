import {
  buildContracts,
  coreFactories,
  serializeContracts,
} from '@hyperlane-xyz/sdk';

import { HyperlaneCoreInfraDeployer } from '../src/core/deploy';
import { readJSON, writeJSON } from '../src/utils/utils';

import {
  getCoreContractsSdkFilepath,
  getCoreEnvironmentConfig,
  getCoreRustDirectory,
  getCoreVerificationDirectory,
  getEnvironment,
} from './utils';

async function main() {
  const environment = await getEnvironment();
  console.log(`Loading Config for environment: ${environment}`);
  const config = getCoreEnvironmentConfig(environment) as any;
  console.log(`Loading Multiprovider for environment: ${environment}`);
  const multiProvider = await config.getMultiProvider();
  console.log(
    `Loading HyperlaneCoreInfraDeployer for environment: ${environment}`,
  );
  const deployer = new HyperlaneCoreInfraDeployer(
    multiProvider,
    config.core,
    environment,
  );

  let previousContracts = {};
  previousAddressParsing: try {
    if (environment === 'test') {
      break previousAddressParsing;
    }
    const addresses = readJSON(
      getCoreContractsSdkFilepath(),
      `${environment}.json`,
    );
    // This is currently empty
    console.log(` Addressees : ${JSON.stringify(addresses)}`);
    previousContracts = buildContracts(addresses, coreFactories);
  } catch (e) {
    console.info('Could not load partial core addresses, file may not exist');
  }

  try {
    await deployer.deploy(previousContracts);
  } catch (e) {
    console.error(`Encountered error during deploy`);
    console.error(e);
  }
  console.log;

  // Persist artifacts, irrespective of deploy success
  writeJSON(
    getCoreContractsSdkFilepath(),
    `${environment}.json`,
    serializeContracts(deployer.deployedContracts),
  );
  const verificationDir = getCoreVerificationDirectory(environment);
  const verificationFile = 'verification.json';
  console.log(
    `Writing verification inputs to ${verificationDir}/${verificationFile}`,
  );
  let existingVerificationInputs = [];
  try {
    existingVerificationInputs = readJSON(verificationDir, verificationFile);
  } finally {
    writeJSON(
      getCoreVerificationDirectory(environment),
      'verification.json',
      deployer.mergeWithExistingVerificationInputs(existingVerificationInputs),
    );
  }
  deployer.writeRustConfigs(getCoreRustDirectory(environment));
}

main().then(console.log).catch(console.error);
