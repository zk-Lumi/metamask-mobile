'use strict';
import { SmokeAssets } from '../../tags';
import TestHelpers from '../../helpers';
import WalletView from '../../pages/WalletView';
import AddCustomTokenView from '../../pages/AddCustomTokenView';
import { loginToApp } from '../../viewHelper';
import {
  withFixtures,
  defaultGanacheOptions,
} from '../../fixtures/fixture-helper';
import { SMART_CONTRACTS } from '../../../app/util/test/smart-contracts';
import FixtureBuilder from '../../fixtures/fixture-builder';

const SMART_CONTRACT = SMART_CONTRACTS.NFTS;

describe(SmokeAssets('Import NFT'), () => {
  beforeAll(async () => {
    jest.setTimeout(150000);
    await TestHelpers.reverseServerPort();
  });

  it('should add a collectible', async () => {
    await withFixtures(
      {
        fixture: new FixtureBuilder().withGanacheNetwork().build(),
        restartDevice: true,
        ganacheOptions: defaultGanacheOptions,
        smartContract: SMART_CONTRACT,
      },
      async ({ contractRegistry }) => {
        const erc1155ContractAddress =
          await contractRegistry.getContractAddress(SMART_CONTRACT);
        await loginToApp();
        // Tap on COLLECTIBLES tab
        await WalletView.tapNftTab();
        await WalletView.scrollDownOnNFTsTab();
        // Tap on the add collectibles button
        await WalletView.tapImportNFTButton();
        await AddCustomTokenView.isVisible();
        // Input incorrect contract address
        await AddCustomTokenView.typeInNFTAddress('1234');
        await AddCustomTokenView.typeInNFTIdentifier('');
        await AddCustomTokenView.isNFTAddressWarningVisible();
        await AddCustomTokenView.tapBackButton();
        await WalletView.tapImportNFTButton();
        await AddCustomTokenView.isVisible();
        await AddCustomTokenView.typeInNFTAddress(erc1155ContractAddress);
        await AddCustomTokenView.typeInNFTIdentifier('1');
        await WalletView.isVisible();
        // Wait for asset to load
        await TestHelpers.delay(3000);
        await WalletView.isNFTVisibleInWallet('TestDappNFTs');
        // Tap on Collectible
        await WalletView.tapOnNFTInWallet('TestDappNFTs');
        await WalletView.isNFTNameVisible('TestDappNFTs #1');
        await WalletView.scrollUpOnNFTsTab();

        // because we witness a bug where nft's disappeared after relaunching
        await device.terminateApp();
        await device.launchApp({ newInstance: false });
        await loginToApp();
        await WalletView.tapNftTab();
        await WalletView.isNFTNameVisible('TestDappNFTs #1');
      },
    );
  });
});
