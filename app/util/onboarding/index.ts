/* eslint-disable import/prefer-default-export */
import compareVersions from 'compare-versions';
import {
  WHATS_NEW_APP_VERSION_SEEN,
  SMART_TRANSACTIONS_OPT_IN_MODAL_APP_VERSION_SEEN,
  CURRENT_APP_VERSION,
  LAST_APP_VERSION,
} from '../../constants/storage';
import { whatsNewList } from '../../components/UI/WhatsNewModal';
import AsyncStorage from '../../store/async-storage-wrapper';
import Logger from '../Logger';

/**
 *
 * @returns Boolean indicating whether or not to show smart transactions opt in modal
 */
const STX_OPT_IN_MIN_APP_VERSION = '7.16.0';

export const shouldShowSmartTransactionOptInModal = async () => {
  const versionSeen = await AsyncStorage.getItem(
    SMART_TRANSACTIONS_OPT_IN_MODAL_APP_VERSION_SEEN,
  );

  const seen =
    !!versionSeen &&
    compareVersions.compare(versionSeen, STX_OPT_IN_MIN_APP_VERSION, '>=');

  Logger.log(
    'STX shouldShowSmartTransactionOptInModal',
    'versionSeen',
    versionSeen,
    'seen',
    seen,
  );

  return true;
  if (seen) return false;

  return true;
};

/**
 * Returns boolean indicating whether or not to show whats new modal
 *
 * @returns Boolean indicating whether or not to show whats new modal
 */
export const shouldShowWhatsNewModal = async () => {
  return true;
  const whatsNewAppVersionSeen = await AsyncStorage.getItem(
    WHATS_NEW_APP_VERSION_SEEN,
  );

  const currentAppVersion = await AsyncStorage.getItem(CURRENT_APP_VERSION);
  const lastAppVersion = await AsyncStorage.getItem(LAST_APP_VERSION);
  const isUpdate = !!lastAppVersion && currentAppVersion !== lastAppVersion;

  const seen =
    !!whatsNewAppVersionSeen &&
    compareVersions.compare(
      whatsNewAppVersionSeen,
      whatsNewList.minAppVersion,
      '>=',
    );

  if (seen) return false;

  if (whatsNewList.onlyUpdates) {
    const updatingCorrect = whatsNewList.onlyUpdates && isUpdate;

    if (!updatingCorrect) return false;

    const lastVersionCorrect = compareVersions.compare(
      lastAppVersion,
      whatsNewList.maxLastAppVersion,
      '<',
    );

    if (!lastVersionCorrect) return false;
  }

  const versionCorrect = compareVersions.compare(
    currentAppVersion as string,
    whatsNewList.minAppVersion,
    '>=',
  );

  if (!versionCorrect) return false;

  if (whatsNewList.slides.length) {
    // Show whats new
    return true;
  }
  return false;
};
