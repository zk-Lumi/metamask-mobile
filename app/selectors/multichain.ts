import { createSelector } from 'reselect';
import { Hex } from '@metamask/utils';
import {
  MultichainNativeAssets,
  Token,
  getNativeTokenAddress,
} from '@metamask/assets-controllers';
import { RootState } from '../reducers';
import {
  selectSelectedInternalAccountFormattedAddress,
  selectSelectedInternalAccount,
} from './accountsController';
import { selectAllTokens } from './tokensController';
import {
  selectAccountBalanceByChainId,
  selectAccountsByChainId,
} from './accountTrackerController';
import {
  selectChainId,
  selectNetworkConfigurations,
  selectProviderConfig,
} from './networkController';
import { TokenI } from '../components/UI/Tokens/types';
import { renderFromWei } from '../util/number';
import { toHex } from '@metamask/controller-utils';
import {
  selectConversionRate,
  selectCurrencyRates,
  selectCurrentCurrency,
} from './currencyRateController';
import { isBtcMainnetAddress } from '../core/Multichain/utils';
import { selectTokenMarketData } from './tokenRatesController';
import { isMainNet } from '../util/networks';
import { isEvmAccountType } from '@metamask/keyring-api';
import { createDeepEqualSelector } from './util';

interface NativeTokenBalance {
  balance: string;
  stakedBalance: string;
  isStaked: boolean;
  name: string;
}

type ChainBalances = Record<string, NativeTokenBalance>;

/**
 * Get the cached native token balance for the selected account by chainId.
 *
 * @param {RootState} state - The root state.
 * @returns {ChainBalances} The cached native token balance for the selected account by chainId.
 */
export const selectedAccountNativeTokenCachedBalanceByChainId = createSelector(
  [selectSelectedInternalAccountFormattedAddress, selectAccountsByChainId],
  (selectedAddress, accountsByChainId): ChainBalances => {
    if (!selectedAddress || !accountsByChainId) {
      return {};
    }

    const result: ChainBalances = {};
    for (const chainId in accountsByChainId) {
      const accounts = accountsByChainId[chainId];
      const account = accounts[selectedAddress];
      if (account) {
        result[chainId] = {
          balance: account.balance,
          stakedBalance: account.stakedBalance ?? '0x0',
          isStaked: account.stakedBalance !== '0x0',
          name: '',
        };
      }
    }

    return result;
  },
);

/**
 * Selector to get native tokens for the selected account across all chains.
 */
export const selectNativeTokensAcrossChains = createSelector(
  [
    selectNetworkConfigurations,
    selectedAccountNativeTokenCachedBalanceByChainId,
    selectCurrencyRates,
    selectCurrentCurrency,
    selectTokenMarketData,
  ],
  (
    networkConfigurations,
    nativeTokenBalancesByChainId,
    currencyRates,
    currentCurrency,
    tokenMarketData,
  ) => {
    const tokensByChain: { [chainId: string]: TokenI[] } = {};
    for (const token of Object.values(networkConfigurations)) {
      const nativeChainId = token.chainId as Hex;
      const nativeTokenInfoByChainId =
        nativeTokenBalancesByChainId[nativeChainId];
      const isETH = ['ETH', 'GOETH', 'SepoliaETH', 'LineaETH'].includes(
        token.nativeCurrency || '',
      );

      const name = isETH ? 'Ethereum' : token.nativeCurrency;
      const logo = isETH ? '../images/eth-logo-new.png' : '';
      tokensByChain[nativeChainId] = [];

      if (
        nativeTokenInfoByChainId &&
        nativeTokenInfoByChainId.isStaked &&
        nativeTokenInfoByChainId.stakedBalance !== '0x00' &&
        nativeTokenInfoByChainId.stakedBalance !== toHex(0)
      ) {
        // Staked tokens
        tokensByChain[nativeChainId].push({
          ...nativeTokenInfoByChainId,
          chainId: nativeChainId,
          address: getNativeTokenAddress(nativeChainId),
          balance: renderFromWei(nativeTokenInfoByChainId.stakedBalance),
          balanceFiat: '',
          isNative: true,
          aggregators: [],
          image: '',
          logo,
          isETH,
          decimals: 18,
          name: 'Staked Ethereum',
          symbol: name,
          isStaked: true,
          ticker: token.nativeCurrency,
        });
      }

      const nativeBalanceFormatted = renderFromWei(
        nativeTokenInfoByChainId?.balance,
      );

      const tokenMarketDataByChainId = tokenMarketData?.[nativeChainId];
      let balanceFiat = '';

      if (
        tokenMarketDataByChainId &&
        Object.keys(tokenMarketDataByChainId).length === 0
      ) {
        const balanceFiatValue =
          parseFloat(nativeBalanceFormatted) *
          (currencyRates?.[token.nativeCurrency]?.conversionRate ?? 0);

        balanceFiat = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currentCurrency,
        }).format(balanceFiatValue);
      }

      // Non-staked tokens
      tokensByChain[nativeChainId].push({
        ...nativeTokenInfoByChainId,
        name,
        address: getNativeTokenAddress(nativeChainId),
        balance: nativeBalanceFormatted,
        chainId: nativeChainId,
        isNative: true,
        aggregators: [],
        balanceFiat,
        image: '',
        logo,
        isETH,
        decimals: 18,
        symbol: name,
        isStaked: false,
        ticker: token.nativeCurrency,
      });
    }

    return tokensByChain;
  },
);

/**
 * Get the tokens for the selected account across all chains.
 *
 * @param {RootState} state - The root state.
 * @returns {TokensByChain} The tokens for the selected account across all chains.
 */
export const selectAccountTokensAcrossChains = createSelector(
  [
    selectSelectedInternalAccount,
    selectAllTokens,
    selectNetworkConfigurations,
    selectNativeTokensAcrossChains,
  ],
  (selectedAccount, allTokens, networkConfigurations, nativeTokens) => {
    const selectedAddress = selectedAccount?.address;
    const tokensByChain: {
      [chainId: string]: (
        | TokenI
        | (Token & { isStaked?: boolean; isNative?: boolean; isETH?: boolean })
      )[];
    } = {};

    if (!selectedAddress) {
      return tokensByChain;
    }

    // Create a list of available chainIds
    const chainIds = Object.keys(networkConfigurations);

    for (const chainId of chainIds) {
      const currentChainId = chainId as Hex;
      const nonNativeTokens =
        allTokens[currentChainId]?.[selectedAddress]?.map((token) => ({
          ...token,
          token: token.name,
          chainId,
          isETH: false,
          isNative: false,
          balanceFiat: '',
          isStaked: false,
        })) || [];

      // Add both native and non-native tokens
      tokensByChain[currentChainId] = [
        ...(nativeTokens[currentChainId] || []),
        ...nonNativeTokens,
      ];
    }

    return tokensByChain;
  },
);

/**
 * Get the state of the `bitcoinSupportEnabled` flag.
 *
 * @param {*} state
 * @returns The state of the `bitcoinSupportEnabled` flag.
 */
export function selectIsBitcoinSupportEnabled(state: RootState) {
  return state.multichainSettings.bitcoinSupportEnabled;
}

/**
 * Get the state of the `bitcoinTestnetSupportEnabled` flag.
 *
 * @param {*} state
 * @returns The state of the `bitcoinTestnetSupportEnabled` flag.
 */
export function selectIsBitcoinTestnetSupportEnabled(state: RootState) {
  return state.multichainSettings.bitcoinTestnetSupportEnabled;
}

export const selectMultichainIsEvm = createSelector(
  selectSelectedInternalAccount,
  (selectedAccount) => {
    // If no account selected, assume EVM for onboarding scenario
    if (!selectedAccount) {
      return true;
    }
    return isEvmAccountType(selectedAccount.type);
  },
);

export const selectMultichainDefaultToken = createSelector(
  selectMultichainIsEvm,
  selectProviderConfig,
  (isEvm, providerConfig) => {
    const symbol = isEvm
      ? providerConfig?.ticker ?? 'ETH'
      : providerConfig?.ticker;
    return { symbol };
  },
);

export const selectMultichainIsBitcoin = createSelector(
  selectMultichainIsEvm,
  selectMultichainDefaultToken,
  (isEvm, token) => !isEvm && token.symbol === 'BTC',
);

export const selectMultichainIsMainnet = createSelector(
  selectMultichainIsEvm,
  selectSelectedInternalAccount,
  selectChainId,
  selectMultichainIsBitcoin,
  (isEvm, selectedAccount, chainId, isBitcoin) => {
    if (isEvm) {
      return isMainNet(chainId);
    }

    // Non-EVM: Currently only Bitcoin
    if (isBitcoin && selectedAccount) {
      return isBtcMainnetAddress(selectedAccount.address);
    }
    return false;
  },
);

/**
 *
 * @param state - Root redux state
 * @returns - MultichainBalancesController state
 */
const selectMultichainBalancesControllerState = (state: RootState) =>
  state.engine.backgroundState.MultichainBalancesController;

export const selectMultichainBalances = createDeepEqualSelector(
  selectMultichainBalancesControllerState,
  (multichainBalancesControllerState) =>
    multichainBalancesControllerState.balances,
);

const selectBtcCachedBalance = createDeepEqualSelector(
  selectMultichainBalances,
  selectSelectedInternalAccount,
  selectMultichainIsMainnet,
  (multichainBalances, selectedInternalAccount, multichainIsMainnet) => {
    const asset = multichainIsMainnet
      ? MultichainNativeAssets.Bitcoin
      : MultichainNativeAssets.BitcoinTestnet;

    return multichainBalances?.[selectedInternalAccount.id]?.[asset]?.amount;
  },
);

export const selectMultichainSelectedAccountCachedBalance = createSelector(
  selectMultichainIsEvm,
  selectAccountBalanceByChainId,
  selectBtcCachedBalance,
  (isEvm, accountBalanceByChainId, btcCachedBalance) =>
    isEvm ? accountBalanceByChainId?.balance ?? '0x0' : btcCachedBalance,
);

export const selectMultichainSelectedAccountCachedBalanceIsZero =
  createSelector(
    selectMultichainSelectedAccountCachedBalance,
    selectMultichainIsEvm,
    (balance, isEvm) => {
      const base = isEvm ? 16 : 10;
      const numericValue = parseInt(balance, base);
      return numericValue === 0;
    },
  );

export const selectMultichainConversionRate = createSelector(
  selectMultichainIsEvm,
  selectConversionRate,
  selectCurrencyRates,
  selectProviderConfig,
  (isEvm, evmConversionRate, currencyRates, providerConfig) => {
    if (isEvm) {
      return evmConversionRate;
    }
    const ticker = providerConfig?.ticker?.toLowerCase();
    return ticker ? currencyRates?.[ticker]?.conversionRate : undefined;
  },
);
