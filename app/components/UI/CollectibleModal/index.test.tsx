import React from 'react';
import configureMockStore from 'redux-mock-store';
import { render } from '@testing-library/react-native';
import CollectibleModal from './index';
import { Provider } from 'react-redux';

const mockStore = configureMockStore();
const initialState = {};
const store = mockStore(initialState);

describe('CollectibleModal', () => {
  it('should render correctly', () => {
    const { toJSON } = render(
      <Provider store={store}>
        <CollectibleModal
          navigation={{}}
          route={{
            params: {
              contractName: 'Opensea',
              collectible: { name: 'Leopard', tokenId: 6904, address: '0x123' },
            },
          }}
        />
      </Provider>,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
