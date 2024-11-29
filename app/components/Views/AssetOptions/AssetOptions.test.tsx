import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AssetOptions from './AssetOptions';
// eslint-disable-next-line import/no-namespace
import * as networks from '../../../util/networks';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ bottom: 10 })),
}));

jest.mock('../../../component-library/hooks', () => ({
  useStyles: () => ({ styles: {} }),
}));

jest.mock('../../../components/hooks/useMetrics', () => ({
  useMetrics: () => ({
    trackEvent: jest.fn(),
    isEnabled: jest.fn(() => true),
  }),
}));

jest.mock('../../../components/UI/Swaps/utils/useBlockExplorer', () =>
  jest.fn(() => ({
    baseUrl: 'https://example-explorer.com',
    token: (address: string) => `https://example-explorer.com/token/${address}`,
  })),
);

jest.mock('../../../core/Engine', () => ({
  context: {
    TokensController: {
      ignoreTokens: jest.fn(),
    },
    NetworkController: {
      findNetworkClientIdByChainId: jest.fn(() => 'test-network'),
    },
  },
}));

jest.mock('../../../core/NotificationManager', () => ({
  showSimpleNotification: jest.fn(),
}));

jest.mock('../../../util/Logger', () => ({
  log: jest.fn(),
}));

jest.mock('../../../constants/navigation/Routes', () => ({
  MODAL: {
    ROOT_MODAL_FLOW: 'RootModalFlow',
  },
  BROWSER: {
    HOME: 'BrowserHome',
    VIEW: 'BrowserView',
  },
}));

jest.mock('../../../selectors/networkController', () => ({
  selectChainId: jest.fn(() => '1'),
  selectProviderConfig: jest.fn(() => ({})),
  selectNetworkConfigurations: jest.fn(() => ({})),
  createProviderConfig: jest.fn(() => ({
    chainId: '1',
    rpcUrl: 'https://example.com',
    chainName: 'Example Chain',
    nativeCurrency: {
      name: 'Example Token',
      symbol: 'EXAMPLE',
      decimals: 18,
    },
  })),
}));

jest.mock('../../../selectors/tokenListController', () => ({
  selectTokenList: jest.fn(() => ({})),
}));

describe('AssetOptions Component', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useSelector as jest.Mock).mockImplementation((selector) => {
      if (selector.name === 'selectChainId') return '1';
      if (selector.name === 'selectProviderConfig') return {};
      if (selector.name === 'selectTokenList')
        return { '0x123': { symbol: 'ABC' } };
      return {};
    });
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('matches the snapshot', () => {
    const { toJSON } = render(
      <AssetOptions
        route={{
          params: {
            address: '0x123',
            chainId: '0x1',
            isNativeCurrency: false,
          },
        }}
      />,
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('should match the snapshot when portfolio view is enabled  ', () => {
    jest
      .spyOn(networks, 'isPortfolioViewEnabledFunction')
      .mockReturnValue(true);
    const { toJSON } = render(
      <AssetOptions
        route={{
          params: {
            address: '0x123',
            chainId: '0x1',
            isNativeCurrency: false,
          },
        }}
      />,
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly and displays options', () => {
    const { getByText } = render(
      <AssetOptions
        route={{
          params: {
            address: '0x123',
            chainId: '0x1',
            isNativeCurrency: false,
          },
        }}
      />,
    );

    expect(getByText('View on Portfolio')).toBeTruthy();
    expect(getByText('View on block explorer')).toBeTruthy();
    expect(getByText('Token details')).toBeTruthy();
    expect(getByText('Remove token')).toBeTruthy();
  });

  it('handles "View on Block Explorer" press', () => {
    const { getByText } = render(
      <AssetOptions
        route={{
          params: {
            address: '0x123',
            chainId: '0x1',
            isNativeCurrency: false,
          },
        }}
      />,
    );

    fireEvent.press(getByText('View on block explorer'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Webview', {
      screen: 'SimpleWebview',
      params: {
        url: 'https://example-explorer.com/token/0x123',
        title: 'example-explorer.com',
      },
    });
  });

  it('handles "Remove Token" press', () => {
    const { getByText } = render(
      <AssetOptions
        route={{
          params: {
            address: '0x123',
            chainId: '0x1',
            isNativeCurrency: false,
          },
        }}
      />,
    );

    fireEvent.press(getByText('Remove token'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('RootModalFlow', {
      screen: 'AssetHideConfirmation',
      params: expect.anything(),
    });
  });

  it('handles "Token Details" press', () => {
    const mockParams = {
      params: {
        address: '0x123',
        chainId: '0x1',
        isNativeCurrency: false,
      },
    };
    const { getByText } = render(<AssetOptions route={mockParams} />);

    fireEvent.press(getByText('Token details'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      'AssetDetails',
      expect.anything(),
    );
  });
});
