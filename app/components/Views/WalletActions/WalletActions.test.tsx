import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import renderWithProvider, {
  DeepPartial,
} from '../../../util/test/renderWithProvider';

import WalletActions from './WalletActions';
import { WalletActionsModalSelectorsIDs } from '../../../../e2e/selectors/Modals/WalletActionsModal.selectors';
import { backgroundState } from '../../../util/test/initial-root-state';
import { RootState } from '../../../reducers';
import { mockNetworkState } from '../../../util/test/network';
import { RpcEndpointType } from '@metamask/network-controller';

const mockInitialState: DeepPartial<RootState> = {
  swaps: { '0x1': { isLive: true }, hasOnboarded: false, isLive: true },
  fiatOrders: {
    networks: [
      {
        active: true,
        chainId: '1',
        chainName: 'Ethereum Mainnet',
        nativeTokenSupported: true,
      },
    ],
  },
  engine: {
    backgroundState: {
      ...backgroundState,
      NetworkController: {
        ...mockNetworkState({
          chainId: '0x1',
          id: 'mainnet',
          nickname: 'Ethereum Mainnet',
          ticker: 'ETH',
          type: RpcEndpointType.Infura,
        }),
      },
    },
  },
};

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualReactNavigation = jest.requireActual('@react-navigation/native');
  return {
    ...actualReactNavigation,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { width: 0, height: 0, x: 0, y: 0 };
  return {
    SafeAreaProvider: jest.fn().mockImplementation(({ children }) => children),
    SafeAreaConsumer: jest
      .fn()
      .mockImplementation(({ children }) => children(inset)),
    useSafeAreaInsets: jest.fn().mockImplementation(() => inset),
    useSafeAreaFrame: jest.fn().mockImplementation(() => frame),
  };
});

describe('WalletActions', () => {
  afterEach(() => {
    mockNavigate.mockClear();
  });
  it('should renderWithProvider correctly', () => {
    jest.mock('react-redux', () => ({
      ...jest.requireActual('react-redux'),
      useSelector: jest
        .fn()
        .mockImplementation((callback) => callback(mockInitialState)),
    }));
    const { getByTestId } = renderWithProvider(<WalletActions />, {
      state: mockInitialState,
    });

    expect(
      getByTestId(WalletActionsModalSelectorsIDs.BUY_BUTTON),
    ).toBeDefined();
    expect(
      getByTestId(WalletActionsModalSelectorsIDs.SEND_BUTTON),
    ).toBeDefined();
    expect(
      getByTestId(WalletActionsModalSelectorsIDs.RECEIVE_BUTTON),
    ).toBeDefined();
    expect(
      getByTestId(WalletActionsModalSelectorsIDs.SWAP_BUTTON),
    ).toBeDefined();
    expect(
      getByTestId(WalletActionsModalSelectorsIDs.BRIDGE_BUTTON),
    ).toBeDefined();
  });

  it('should not show the buy button and swap button if the chain does not allow buying', () => {
    const mockState: DeepPartial<RootState> = {
      swaps: { '0x1': { isLive: false }, hasOnboarded: false, isLive: true },
      fiatOrders: {
        networks: [
          {
            active: true,
            chainId: '1',
            chainName: 'Ethereum Mainnet',
            nativeTokenSupported: true,
          },
        ],
      },
      engine: {
        backgroundState: {
          ...backgroundState,
          NetworkController: {
            ...mockNetworkState({
              chainId: '0xaa36a7',
              id: 'sepolia',
              nickname: 'Sepolia',
              ticker: 'ETH',
            }),
          },
        },
      },
    };

    jest.mock('react-redux', () => ({
      ...jest.requireActual('react-redux'),
      useSelector: jest
        .fn()
        .mockImplementation((callback) => callback(mockState)),
    }));

    const { queryByTestId } = renderWithProvider(<WalletActions />, {
      state: mockState,
    });

    expect(queryByTestId(WalletActionsModalSelectorsIDs.BUY_BUTTON)).toBeNull();
    expect(
      queryByTestId(WalletActionsModalSelectorsIDs.SWAP_BUTTON),
    ).toBeNull();
    expect(
      queryByTestId(WalletActionsModalSelectorsIDs.BRIDGE_BUTTON),
    ).toBeNull();
  });

  it('should call the onBuy function when the Buy button is pressed', () => {
    const { getByTestId } = renderWithProvider(<WalletActions />, {
      state: mockInitialState,
    });

    fireEvent.press(getByTestId(WalletActionsModalSelectorsIDs.BUY_BUTTON));
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('should call the onSend function when the Send button is pressed', () => {
    const mockState: DeepPartial<RootState> = {
      engine: {
        backgroundState: {
          ...backgroundState,
          NetworkController: {
            ...mockNetworkState({
              chainId: '0xaa36a7',
              id: 'sepolia',
              nickname: 'Sepolia',
              ticker: 'ETH',
            }),
          },
        },
      },
    };

    const { getByTestId } = renderWithProvider(<WalletActions />, {
      state: mockState,
    });

    fireEvent.press(getByTestId(WalletActionsModalSelectorsIDs.SEND_BUTTON));

    expect(mockNavigate).toHaveBeenCalled();
  });
  it('should call the goToSwaps function when the Swap button is pressed', () => {
    const { getByTestId } = renderWithProvider(<WalletActions />, {
      state: mockInitialState,
    });

    fireEvent.press(getByTestId(WalletActionsModalSelectorsIDs.SWAP_BUTTON));

    expect(mockNavigate).toHaveBeenCalled();
  });
  it('should call the goToBridge function when the Bridge button is pressed', () => {
    const { getByTestId } = renderWithProvider(<WalletActions />, {
      state: mockInitialState,
    });

    fireEvent.press(getByTestId(WalletActionsModalSelectorsIDs.BRIDGE_BUTTON));

    expect(mockNavigate).toHaveBeenCalled();
  });
});
