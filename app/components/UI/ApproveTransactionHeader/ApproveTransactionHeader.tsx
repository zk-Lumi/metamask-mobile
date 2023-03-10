import React, { useState, useEffect, useMemo } from 'react';
import { View } from 'react-native';

import { getHost } from '../../../util/browser';
import { useSelector } from 'react-redux';
import {
  getNetworkNameFromProvider,
  getNetworkImageSource,
} from '../../../util/networks';

import {
  renderShortAddress,
  renderAccountName,
  getLabelTextByAddress,
} from '../../../util/address';
import { WALLET_CONNECT_ORIGIN } from '../../../util/walletconnect';
import { MM_SDK_REMOTE_ORIGIN } from '../../../core/SDKConnect';
import { renderFromWei, hexToBN } from '../../../util/number';
import { toChecksumAddress } from 'ethereumjs-util';
import { getTicker } from '../../../util/transactions';
import AccountBalance from '../../../component-library/components-temp/Accounts/AccountBalance';
import TagUrl from '../../../component-library/components/Tags/TagUrl';

import { BadgeVariants } from '../../../component-library/components/Badges/Badge/Badge.types';
import { strings } from '../../../../locales/i18n';
import { useStyles } from '../../../component-library/hooks';
import stylesheet from './ApproveTransactionHeader.styles';
import {
  FAV_ICON_URL,
  ORIGIN_DEEPLINK,
  ORIGIN_QR_CODE,
} from './ApproveTransactionHeader.constants';
import {
  AccountInfoI,
  ApproveTransactionHeaderI,
  OriginsI,
} from './ApproveTransactionHeader.types';
import { AvatarAccountType } from '../../../component-library/components/Avatars/Avatar/variants/AvatarAccount';
import { selectProviderConfig } from '../../../selectors/networkController';

const ApproveTransactionHeader = ({
  from,
  origin,
  url,
  currentEnsName,
}: ApproveTransactionHeaderI) => {
  const [accountInfo, setAccountInfo] = useState<AccountInfoI>({
    balance: 0,
    currency: '',
    accountName: '',
  });
  const [origins, setOrigins] = useState<OriginsI>({
    isOriginDeepLink: false,
    isOriginWalletConnect: false,
    isOriginMMSDKRemoteConn: false,
  });

  const { styles } = useStyles(stylesheet, {});

  const accounts = useSelector(
    (state: any) =>
      state.engine.backgroundState.AccountTrackerController.accounts,
  );

  const identities = useSelector(
    (state: any) =>
      state.engine.backgroundState.PreferencesController.identities,
  );

  const network = useSelector(
    (state: any) =>
      state.engine.backgroundState.NetworkController.providerConfig,
  );

  const accountAvatarType = useSelector((state: any) =>
    state.settings.useBlockieIcon
      ? AvatarAccountType.Blockies
      : AvatarAccountType.JazzIcon,
  );
  const activeAddress = toChecksumAddress(from);

  const networkProvider = useSelector(selectProviderConfig);
  const networkName = getNetworkNameFromProvider(networkProvider);

  useEffect(() => {
    const { ticker } = network;
    const weiBalance = activeAddress
      ? hexToBN(accounts[activeAddress].balance)
      : 0;

    const balance = Number(renderFromWei(weiBalance));
    const currency = getTicker(ticker);
    const accountName = activeAddress
      ? renderAccountName(activeAddress, identities)
      : '';

    const isOriginDeepLink =
      origin === ORIGIN_DEEPLINK || origin === ORIGIN_QR_CODE;
    const isOriginWalletConnect = origin?.startsWith(WALLET_CONNECT_ORIGIN);

    const isOriginMMSDKRemoteConn = origin?.startsWith(MM_SDK_REMOTE_ORIGIN);

    setAccountInfo({
      balance,
      currency,
      accountName,
    });
    setOrigins({
      isOriginDeepLink,
      isOriginWalletConnect,
      isOriginMMSDKRemoteConn,
    });
  }, [accounts, identities, origin, activeAddress, network]);

  const networkImage = getNetworkImageSource({
    networkType: networkProvider.type,
    chainId: networkProvider.chainId,
  });

  const domainTitle = useMemo(() => {
    const { isOriginDeepLink, isOriginWalletConnect, isOriginMMSDKRemoteConn } =
      origins;
    let title = '';
    if (isOriginDeepLink) title = renderShortAddress(from);
    else if (isOriginWalletConnect)
      title = getHost(origin.split(WALLET_CONNECT_ORIGIN)[1]);
    else if (isOriginMMSDKRemoteConn) {
      title = getHost(origin.split(MM_SDK_REMOTE_ORIGIN)[1]);
    } else title = getHost(currentEnsName || url || origin);

    return title;
  }, [currentEnsName, origin, origins, from, url]);

  const favIconUrl = useMemo(() => {
    const { isOriginWalletConnect, isOriginMMSDKRemoteConn } = origins;
    let newUrl = url;
    if (isOriginWalletConnect) {
      newUrl = origin.split(WALLET_CONNECT_ORIGIN)[1];
    } else if (isOriginMMSDKRemoteConn) {
      newUrl = origin.split(MM_SDK_REMOTE_ORIGIN)[1];
    }
    return FAV_ICON_URL(getHost(newUrl));
  }, [origin, origins, url]);

  const importedOrHardwareLabel = getLabelTextByAddress(activeAddress);

  return (
    <View style={styles.transactionHeader}>
      <TagUrl
        imageSource={{ uri: favIconUrl }}
        label={domainTitle}
        style={styles.tagUrl}
      />
      <AccountBalance
        accountAddress={activeAddress}
        accountNativeCurrency={accountInfo.currency}
        accountBalance={accountInfo.balance}
        accountName={accountInfo.accountName}
        accountTypeLabel={importedOrHardwareLabel}
        accountBalanceLabel={strings('transaction.balance')}
        avatarIconType={accountAvatarType}
        accountNetwork={networkName}
        badgeProps={{
          variant: BadgeVariants.Network,
          name: networkName,
          imageSource: networkImage,
        }}
      />
    </View>
  );
};

export default ApproveTransactionHeader;
