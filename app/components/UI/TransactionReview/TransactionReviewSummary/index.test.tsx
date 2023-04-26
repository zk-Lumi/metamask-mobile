import React from 'react';
import TransactionReviewSummary from './';
import configureMockStore from 'redux-mock-store';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

const mockStore = configureMockStore();
const initialState = {
  engine: {
    backgroundState: {
      TokenRatesController: {
        contractExchangeRates: {},
      },
      CurrencyRateController: {
        currentCurrency: 'usd',
        conversionRate: 0.1,
      },
      TokensController: {
        tokens: [],
      },
      NetworkController: {
        providerConfig: {
          ticker: 'ETH',
        },
      },
    },
  },
  settings: {
    showHexData: true,
  },
  transaction: {
    value: '',
    data: '',
    from: '0x1',
    gas: '',
    gasPrice: '',
    to: '0x2',
    selectedAsset: undefined,
    assetType: undefined,
  },
};
const store = mockStore(initialState);

describe('TransactionReviewSummary', () => {
  it('should render correctly', () => {
    const { toJSON } = render(
      <Provider store={store}>
        <TransactionReviewSummary />
      </Provider>,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
