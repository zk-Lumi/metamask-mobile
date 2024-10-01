import {
  renderFromTokenMinimalUnit,
  addCurrencySymbol,
  balanceToFiatNumber,
} from '../../../../util/number';
import { safeToChecksumAddress } from '../../../../util/address';
import { TOKEN_BALANCE_LOADING, TOKEN_RATE_UNDEFINED } from '../constants';
import { TokenI } from '../types';
import { deriveBalanceFromAssetMarketDetails } from './deriveBalanceFromAssetMarketDetails';

// Mock utility functions
jest.mock('../../../../util/number', () => ({
  renderFromTokenMinimalUnit: jest.fn(),
  addCurrencySymbol: jest.fn(),
  balanceToFiatNumber: jest.fn(),
}));

jest.mock('../../../../util/address', () => ({
  safeToChecksumAddress: jest.fn(),
}));

describe('deriveBalanceFromAssetMarketDetails', () => {
  const asset: TokenI = {
    address: '0x123',
    symbol: 'ABC',
    balance: '100',
    decimals: 18,
    isETH: false,
    balanceFiat: '50',
    aggregators: [],
    balanceError: null,
    image: '',
    name: '',
    logo: undefined,
  };

  const tokenExchangeRates = {
    '0x123': { price: 2 },
  };

  const tokenBalances = {
    '0x123': '2000000000000000000', // equivalent to 2 tokens
  };

  const conversionRate = 1.2;
  const currentCurrency = 'USD';

  beforeEach(() => {
    jest.clearAllMocks();
    (safeToChecksumAddress as jest.Mock).mockReturnValue('0x123');
  });

  it('should return balanceFiat and balanceValueFormatted when token data is available', () => {
    (renderFromTokenMinimalUnit as jest.Mock).mockReturnValue('2');
    (balanceToFiatNumber as jest.Mock).mockReturnValue(4);
    (addCurrencySymbol as jest.Mock).mockReturnValue('$4.00');

    const result = deriveBalanceFromAssetMarketDetails(
      asset,
      tokenExchangeRates,
      tokenBalances,
      conversionRate,
      currentCurrency,
    );

    expect(result).toEqual({
      balanceFiat: '$4.00',
      balanceValueFormatted: '100 ABC',
    });
  });

  it('should return TOKEN_BALANCE_LOADING when balance is missing and asset is not ETH', () => {
    const modifiedAsset = { ...asset, balance: '' };
    (renderFromTokenMinimalUnit as jest.Mock).mockReturnValue('');

    const result = deriveBalanceFromAssetMarketDetails(
      modifiedAsset,
      tokenExchangeRates,
      tokenBalances,
      conversionRate,
      currentCurrency,
    );

    expect(result).toEqual({
      balanceFiat: TOKEN_BALANCE_LOADING,
      balanceValueFormatted: TOKEN_BALANCE_LOADING,
    });
  });

  it('should return balanceFiat and TOKEN_BALANCE_LOADING if conversionRate is not available and asset is not ETH', () => {
    const result = deriveBalanceFromAssetMarketDetails(
      asset,
      tokenExchangeRates,
      tokenBalances,
      undefined,
      currentCurrency,
    );

    expect(result).toEqual({
      balanceFiat: 'tokenBalanceLoading',
      balanceValueFormatted: '100 ABC',
    });
  });

  it('should return balanceFiat and TOKEN_BALANCE_LOADING if conversionRate is not available and asset is ETH', () => {
    const modifiedAsset = { ...asset, isETH: true };
    const result = deriveBalanceFromAssetMarketDetails(
      modifiedAsset,
      tokenExchangeRates,
      tokenBalances,
      undefined,
      currentCurrency,
    );

    expect(result).toEqual({
      balanceFiat: '50',
      balanceValueFormatted: '100 ABC',
    });
  });

  it('should return TOKEN_RATE_UNDEFINED when tokenMarketData is not available', () => {
    const result = deriveBalanceFromAssetMarketDetails(
      asset,
      {},
      tokenBalances,
      conversionRate,
      currentCurrency,
    );

    expect(result).toEqual({
      balanceFiat: TOKEN_RATE_UNDEFINED,
      balanceValueFormatted: '100 ABC',
    });
  });

  it('should return < 0.01 USD if fiat balance is less than 0.01', () => {
    (renderFromTokenMinimalUnit as jest.Mock).mockReturnValue('2');
    (balanceToFiatNumber as jest.Mock).mockReturnValue(0.005);
    (addCurrencySymbol as jest.Mock).mockReturnValue('$0.01');

    const modifiedAsset = { ...asset, balanceFiat: '0.00001' };

    const result = deriveBalanceFromAssetMarketDetails(
      modifiedAsset,
      tokenExchangeRates,
      tokenBalances,
      conversionRate,
      currentCurrency,
    );

    expect(result).toEqual({
      balanceFiat: '< $0.01',
      balanceValueFormatted: '100 ABC',
    });
    expect(addCurrencySymbol).toHaveBeenCalledWith('0.01', 'USD');
  });
});