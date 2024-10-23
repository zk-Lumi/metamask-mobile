'use strict';
import { loginToApp } from '../../viewHelper.js';
import { SmokeCore } from '../../tags.js';
import TabBarComponent from '../../pages/TabBarComponent.js';
import WalletActionsModal from '../../pages/modals/WalletActionsModal.js';
import SendView from '../../pages/Send/SendView.js';
import AmountView from '../../pages/Send/AmountView.js';
import TransactionConfirmView from '../../pages/Send/TransactionConfirmView.js';
import { startMockServer, stopMockServer } from '../../mockServer/mockServer.js';
import WalletView from '../../pages/wallet/WalletView.js';
import Assertions from '../../utils/Assertions.js';
import AccountListView from '../../pages/AccountListView.js';
import AddAccountModal from '../../pages/modals/AddAccountModal.js';
import ImportAccountView from '../../pages/importAccount/ImportAccountView.js';
import Accounts from '../../../wdio/helpers/Accounts.js';
import { withFixtures } from '../../fixtures/fixture-helper.js';
import FixtureBuilder from '../../fixtures/fixture-builder.js';
import TestHelpers from '../../helpers.js';
import { urls } from '../../mockServer/mockUrlCollection.json';
import SuccessImportAccountView from '../../pages/importAccount/SuccessImportAccountView';

describe(SmokeCore('Mock suggestedGasApi fallback to legacy gas endpoint  when EIP1559 endpoint is down'), () => {
  let mockServer;
  beforeAll(async () => {
    jest.setTimeout(150000);
    await TestHelpers.reverseServerPort();

    mockServer = await startMockServer({ // Configure mock server
      mockUrl: urls.suggestedGasApiMainnet,
      responseCode: 500,
      responseBody: { error: 'Internal server error' },
    });
  });

  afterAll(async () => {
    try {
      await stopMockServer();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Mock server already stopped or encountered an error:', error);
    }
  });

  const RECIPIENT = '0x1FDb169Ef12954F20A15852980e1F0C122BfC1D6';
  const AMOUNT = '0.0003';
  const validPrivateKey = Accounts.getAccountPrivateKey();

  it('should fallback to legacy gas endpoint & legacy modal when EIP1559 endpoint is down', async () => {
    await withFixtures(
      {
        fixture: new FixtureBuilder().build(),
        restartDevice: true,
      },
      async () => {
        await loginToApp();
        await WalletView.tapIdenticon();
        await Assertions.checkIfVisible(AccountListView.accountList);
        await AccountListView.tapAddAccountButton();
        await AddAccountModal.tapImportAccount();
        await Assertions.checkIfVisible(ImportAccountView.container);
        await ImportAccountView.enterPrivateKey(validPrivateKey.keys);
        await Assertions.checkIfVisible(SuccessImportAccountView.container);
        await SuccessImportAccountView.tapCloseButton();
        if (device.getPlatform() === 'ios') {
          await AccountListView.swipeToDismissAccountsModal();
          await Assertions.checkIfNotVisible(AccountListView.title);
        } else {
          await WalletView.tapIdenticon();
        }
        await TabBarComponent.tapActions();
        await WalletActionsModal.tapSendButton();
        await SendView.inputAddress(RECIPIENT);
        await SendView.tapNextButton();
        await AmountView.typeInTransactionAmount(AMOUNT);
        await AmountView.tapNextButton();
        await TransactionConfirmView.tapEstimatedGasLink(1);
        await Assertions.checkIfVisible(
          TransactionConfirmView.editPriorityLegacyModal,
        );
        await stopMockServer(); //stop mock server to reinstate suggested gas api service
        await Assertions.checkIfVisible(
          TransactionConfirmView.editPriorityFeeSheetContainer, 30000
        );
      },
    );
  });
});
