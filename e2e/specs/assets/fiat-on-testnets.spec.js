'use strict';
import { SmokeAssets } from '../../tags.js';
import SettingsView from '../../pages/Settings/SettingsView.js';
import TabBarComponent from '../../pages/TabBarComponent.js';
import { loginToApp } from '../../viewHelper.js';
import FixtureBuilder from '../../fixtures/fixture-builder.js';
import { withFixtures } from '../../fixtures/fixture-helper.js';
import { CustomNetworks } from '../../resources/networks.e2e.js';
import NetworkListModal from '../../pages/modals/NetworkListModal.js';
import WalletView from '../../pages/WalletView.js';
import NetworkEducationModal from '../../pages/modals/NetworkEducationModal.js';
import AdvancedSettingsView from '../../pages/Settings/AdvancedView.js';
import FiatOnTestnetsModal from '../../pages/modals/FiatOnTestnetsModal.js';
import Assertions from '../../utils/Assertions.js';
import Matchers from '../../utils/Matchers.js';
import TestHelpers from '../../helpers.js';
import { WalletViewSelectorsIDs } from '../../selectors/wallet/WalletView.selectors.js';

const SEPOLIA = CustomNetworks.Sepolia.providerConfig.nickname;

describe(SmokeAssets('Fiat On Testnets Setting'), () => {
  beforeEach(async () => {
    jest.setTimeout(150000);
    await TestHelpers.reverseServerPort();
  });

  it('should show fiat values on testnets when enabled', async () => {
    await withFixtures(
      {
        fixture: new FixtureBuilder().withSepoliaNetwork().build(),
        restartDevice: true,
      },
      async () => {
        await loginToApp();

        // Verify no fiat values displayed
        await Assertions.checkIfHasText(
          Matchers.getElementByID(WalletViewSelectorsIDs.TOTAL_BALANCE_TEXT),
          '$0',
        );

        // Wait for network switch toast to disapear
        await TestHelpers.delay(2500);

        // Enable fiat on testnets setting
        await TabBarComponent.tapSettings();
        await SettingsView.tapAdvancedTitle();
        await AdvancedSettingsView.scrollToShowFiatOnTestnetsToggle();
        await AdvancedSettingsView.tapShowFiatOnTestnetsSwitch();
        await FiatOnTestnetsModal.tapContinueButton();

        // Verify fiat values are displayed
        await TabBarComponent.tapWallet();
        await Assertions.checkIfElementNotToHaveText(
          Matchers.getElementByID(WalletViewSelectorsIDs.TOTAL_BALANCE_TEXT),
          '$0',
        );
      },
    );
  });
});
