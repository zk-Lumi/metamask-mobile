import { createSelector } from 'reselect';
import { CurrencyRateState } from '@metamask/assets-controllers';
import { RootState } from '../reducers';
import { selectChainId, selectTicker } from './networkController';
import { isTestNet } from '../../app/util/networks';

const selectCurrencyRateControllerState = (state: RootState) =>
  state?.engine?.backgroundState?.CurrencyRateController;

export const selectConversionRate = createSelector(
  selectCurrencyRateControllerState,
  selectChainId,
  selectTicker,
  (state: RootState) => state.settings.showFiatOnTestnets,
  (
    currencyRateControllerState: CurrencyRateState,
    chainId: string,
    ticker: string,
    showFiatOnTestnets,
  ) => {
    if (chainId && isTestNet(chainId) && !showFiatOnTestnets) {
      return undefined;
    }
    return ticker
      ? currencyRateControllerState?.currencyRates?.[ticker]?.conversionRate
      : undefined;
  },
);

export const selectConversionRateFoAllChains = createSelector(
  selectCurrencyRateControllerState,
  (currencyRateControllerState: CurrencyRateState) =>
    currencyRateControllerState?.currencyRates,
);

export const selectCurrentCurrency = createSelector(
  selectCurrencyRateControllerState,
  selectTicker,

  (currencyRateControllerState: CurrencyRateState) =>
    currencyRateControllerState?.currentCurrency,
);

export const selectConversionRateByTicker = createSelector(
  selectCurrencyRateControllerState,
  (_: RootState, ticker: string) => ticker,
  (currencyRateControllerState: CurrencyRateState, ticker: string) =>
    ticker
      ? currencyRateControllerState?.currencyRates?.[ticker]?.conversionRate ||
        0
      : 0,
);
