'use strict';

import { SmokeAssets } from '../../tags';
import TestHelpers from '../../helpers';
import { loginToApp } from '../../viewHelper';
import FixtureBuilder from '../../fixtures/fixture-builder';
import {
  withFixtures,
  defaultGanacheOptions,
} from '../../fixtures/fixture-helper';
import { SMART_CONTRACTS } from '../../../app/util/test/smart-contracts';
import WalletView from '../../pages/wallet/WalletView';
import ImportNFTView from '../../pages/wallet/ImportNFTFlow/ImportNFTView';
import Assertions from '../../utils/Assertions';
import enContent from '../../../locales/languages/en.json';
import { getFixturesServerPort } from '../../fixtures/utils';
import NftDetectionModal from '../../pages/modals/NftDetectionModal';

describe(SmokeAssets('NFT Details page'), () => {
  const NFT_CONTRACT = SMART_CONTRACTS.NFTS;
  const TEST_DAPP_CONTRACT = 'TestDappNFTs';
  beforeAll(async () => {
    jest.setTimeout(170000);
    await TestHelpers.reverseServerPort();
  });

  it('show nft details', async () => {
    await withFixtures(
      {
        dapp: true,
        fixture: new FixtureBuilder()
          .withGanacheNetwork()
          .withPermissionControllerConnectedToTestDapp()
          .build(),
        restartDevice: true,
        ganacheOptions: defaultGanacheOptions,
        smartContract: NFT_CONTRACT,
      },
      async ({ contractRegistry }) => {
        const nftsAddress = await contractRegistry.getContractAddress(
          NFT_CONTRACT,
        );

        await loginToApp();

        await WalletView.tapNftTab();
        await WalletView.scrollDownOnNFTsTab();
        // Tap on the add collectibles button
        await WalletView.tapImportNFTButton();
        await Assertions.checkIfVisible(ImportNFTView.container);
        await ImportNFTView.typeInNFTAddress(nftsAddress);
        await ImportNFTView.typeInNFTIdentifier('1');

        await Assertions.checkIfVisible(WalletView.container);
        // Wait for asset to load
        await Assertions.checkIfVisible(
          WalletView.nftInWallet(TEST_DAPP_CONTRACT),
        );
        await WalletView.tapOnNftName();

        await Assertions.checkIfTextIsDisplayed(enContent.nft_details.token_id);
        await Assertions.checkIfTextIsDisplayed(
          enContent.nft_details.contract_address,
        );
        await Assertions.checkIfTextIsDisplayed(
          enContent.nft_details.token_standard,
        );
      },
    );
  });

  it('show imported NFT after killing app', async () => {
    await withFixtures(
      {
        dapp: true,
        fixture: new FixtureBuilder()
          .withPreferencesController({
            useNftDetection: false,
          })
          .build(),
        restartDevice: true,
        ganacheOptions: defaultGanacheOptions,
      },
      async () => {
        const nftsAddress = '0x6CB26dF0c825fEcE867a84658f87b0eCbceA72f6';
        const testNftOnMainnet = 'LifesAJokeNFT';

        await loginToApp();
        await Assertions.checkIfVisible(NftDetectionModal.container);
        await NftDetectionModal.tapCancelButton();
        await WalletView.tapNftTab();
        await WalletView.scrollDownOnNFTsTab();
        // Tap on the add collectibles button
        await WalletView.tapImportNFTButton();
        await Assertions.checkIfVisible(ImportNFTView.container);
        await ImportNFTView.typeInNFTAddress(nftsAddress);
        await ImportNFTView.typeInNFTIdentifier('2875');

        await Assertions.checkIfVisible(WalletView.container);
        // Wait for asset to load
        await Assertions.checkIfVisible(
          WalletView.nftInWallet(testNftOnMainnet),
        );

        await device.terminateApp();
        await device.launchApp({
          delete: false,
          fixtureServerPort: `${getFixturesServerPort()}`,
        });

        await loginToApp();
        await Assertions.checkIfVisible(WalletView.container);
        await WalletView.tapNftTab();
        // check NFT is there
        await Assertions.checkIfTextIsDisplayed(testNftOnMainnet);
      },
    );
  });
});
