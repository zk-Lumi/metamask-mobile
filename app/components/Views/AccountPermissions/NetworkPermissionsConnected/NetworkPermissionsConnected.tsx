// Third party dependencies.
import React, { useCallback, useContext } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

// External dependencies.
import SheetActions from '../../../../component-library/components-temp/SheetActions';
import SheetHeader from '../../../../component-library/components/Sheet/SheetHeader';
import { strings } from '../../../../../locales/i18n';
import TagUrl from '../../../../component-library/components/Tags/TagUrl';
import PickerNetwork from '../../../../component-library/components/Pickers/PickerNetwork';
import {
  getDecimalChainId,
  isMultichainVersion1Enabled,
} from '../../../../util/networks';
import AccountSelectorList from '../../../../components/UI/AccountSelectorList';
import { AccountPermissionsScreens } from '../AccountPermissions.types';
import { switchActiveAccounts } from '../../../../core/Permissions';
import {
  ToastContext,
  ToastVariants,
} from '../../../../component-library/components/Toast';
import getAccountNameWithENS from '../../../../util/accounts';
import { MetaMetricsEvents } from '../../../../core/Analytics';
import Routes from '../../../../constants/navigation/Routes';
import {
  selectProviderConfig,
  ProviderConfig,
} from '../../../../selectors/networkController';
import { useNetworkInfo } from '../../../../selectors/selectedNetworkController';
import { ConnectedAccountsSelectorsIDs } from '../../../../../e2e/selectors/Browser/ConnectedAccountModal.selectors';
import {
  IconColor,
  IconName,
} from '../../../../component-library/components/Icons/Icon';
import ButtonIcon, {
  ButtonIconSizes,
} from '../../../../component-library/components/Buttons/ButtonIcon';

// Internal dependencies.
import { NetworkPermissionsConnectedProps } from './NetworkPermissionsConnected.types';
import styles from './NetworkPermissionsConnected.styles';
import { useMetrics } from '../../../../components/hooks/useMetrics';
import Text, {
  TextVariant,
} from '../../../../component-library/components/Texts/Text';
import Avatar, {
  AvatarSize,
  AvatarVariant,
} from '../../../../component-library/components/Avatars/Avatar';
import Button, {
  ButtonSize,
  ButtonVariants,
  ButtonWidthTypes,
} from '../../../../component-library/components/Buttons/Button';

const AccountPermissionsConnected = ({
  ensByAccountAddress,
  accounts,
  isLoading,
  selectedAddresses,
  onSetPermissionsScreen,
  onSetSelectedAddresses,
  onDismissSheet,
  hostname,
  favicon,
  secureIcon,
  accountAvatarType,
  urlWithProtocol,
}: NetworkPermissionsConnectedProps) => {
  const { navigate } = useNavigation();
  const { trackEvent } = useMetrics();

  console.log('>>> NetworkPermissionsConnected');
  const providerConfig: ProviderConfig = useSelector(selectProviderConfig);

  const { networkName, networkImageSource } = useNetworkInfo(hostname);

  const activeAddress = selectedAddresses[0];
  const { toastRef } = useContext(ToastContext);

  const onConnectMoreAccounts = useCallback(() => {
    onSetSelectedAddresses([]);
    onSetPermissionsScreen(AccountPermissionsScreens.ConnectMoreAccounts);
  }, [onSetSelectedAddresses, onSetPermissionsScreen]);

  const openRevokePermissions = () =>
    onSetPermissionsScreen(AccountPermissionsScreens.Revoke);

  const switchActiveAccount = useCallback(
    (address: string) => {
      if (address !== activeAddress) {
        switchActiveAccounts(hostname, address);
      }
      onDismissSheet();
      const activeAccountName = getAccountNameWithENS({
        accountAddress: address,
        accounts,
        ensByAccountAddress,
      });
      toastRef?.current?.showToast({
        variant: ToastVariants.Account,
        labelOptions: [
          {
            label: `${activeAccountName} `,
            isBold: true,
          },
          { label: strings('toast.now_active') },
        ],
        accountAddress: address,
        accountAvatarType,
        hasNoTimeout: false,
      });
    },
    [
      activeAddress,
      onDismissSheet,
      accounts,
      ensByAccountAddress,
      hostname,
      toastRef,
      accountAvatarType,
    ],
  );

  const switchNetwork = useCallback(() => {
    navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
      screen: Routes.SHEET.NETWORK_SELECTOR,
    });

    trackEvent(MetaMetricsEvents.NETWORK_SELECTOR_PRESSED, {
      chain_id: getDecimalChainId(providerConfig.chainId),
    });
  }, [providerConfig.chainId, navigate, trackEvent]);

  const renderSheetAction = useCallback(
    () => (
      <View
        style={styles.sheetActionContainer}
        testID={ConnectedAccountsSelectorsIDs.CONNECT_ACCOUNTS_BUTTON}
      >
        <SheetActions
          actions={[
            {
              label: strings('accounts.connect_more_accounts'),
              onPress: onConnectMoreAccounts,
              disabled: isLoading,
            },
          ]}
        />
      </View>
    ),
    [onConnectMoreAccounts, isLoading],
  );

  return (
    <>
      {!isMultichainVersion1Enabled && (
        <SheetHeader title={strings('accounts.connected_accounts_title')} />
      )}
      {isMultichainVersion1Enabled && (
        <View style={styles.header}>
          <Avatar
            variant={AvatarVariant.Favicon}
            imageSource={favicon}
            size={AvatarSize.Md}
          />
        </View>
      )}
      <View style={styles.body}>
        {!isMultichainVersion1Enabled && (
          <TagUrl
            imageSource={favicon}
            label={urlWithProtocol}
            cta={{
              label: strings('accounts.permissions'),
              onPress: openRevokePermissions,
            }}
            iconName={secureIcon}
          />
        )}
        {isMultichainVersion1Enabled && (
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle} variant={TextVariant.HeadingSM}>
              {strings('permissions.permitted_networks')}
            </Text>
            <View style={styles.infoButtonContainer}>
              <ButtonIcon
                size={ButtonIconSizes.Md}
                iconName={IconName.Info}
                iconColor={IconColor.Default}
                onPress={() => {
                  navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
                    screen: Routes.SHEET.PERMITTED_NETWORKS_INFO_SHEET,
                  });
                }}
              />
            </View>
          </View>
        )}
        {!isMultichainVersion1Enabled && (
          <PickerNetwork
            label={providerConfig?.nickname || networkName}
            imageSource={networkImageSource}
            onPress={switchNetwork}
            style={styles.networkPicker}
            testID={ConnectedAccountsSelectorsIDs.NETWORK_PICKER}
          />
        )}
      </View>
      <AccountSelectorList
        onSelectAccount={switchActiveAccount}
        accounts={accounts}
        ensByAccountAddress={ensByAccountAddress}
        isLoading={isLoading}
        selectedAddresses={selectedAddresses}
        isRemoveAccountEnabled
      />
      {isMultichainVersion1Enabled && (
        <Button
          style={styles.managePermissionsButton}
          variant={ButtonVariants.Secondary}
          label={strings('permissions.edit_permissions')}
          size={ButtonSize.Lg}
          onPress={() => {
            onSetPermissionsScreen(
              AccountPermissionsScreens.PermissionsSummary,
            );
          }}
          width={ButtonWidthTypes.Full}
        />
      )}
    </>
  );
};

export default AccountPermissionsConnected;
