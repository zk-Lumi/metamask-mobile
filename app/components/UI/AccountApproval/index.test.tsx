import React from 'react';
import AccountApproval from '.';
import { backgroundState } from '../../../util/test/initial-root-state';
import renderWithProvider from '../../../util/test/renderWithProvider';
import { MOCK_ACCOUNTS_CONTROLLER_STATE } from '../../../util/test/accountsControllerTestUtils';
import { mockNetworkState } from '../../../util/test/network';
import { RpcEndpointType } from '@metamask/network-controller';

jest.mock('../../../core/Engine', () => ({
  context: {
    PhishingController: {
      maybeUpdateState: jest.fn(),
      test: jest.fn((url: string) => {
        if (url === 'phishing.com') return { result: true };
        return { result: false };
      }),
    },
    KeyringController: {
      getAccountKeyringType: () => Promise.resolve('HD Key Tree'),
      state: {
        keyrings: [
          {
            accounts: ['0xC4966c0D659D99699BFD7EB54D8fafEE40e4a756'],
          },
        ],
      },
    },
  },
}));

const mockInitialState = {
  engine: {
    backgroundState: {
      ...backgroundState,
      AccountsController: {
        ...MOCK_ACCOUNTS_CONTROLLER_STATE,
        accounts: {
          '0xC4966c0D659D99699BFD7EB54D8fafEE40e4a756': {
            balance: '0x0',
            name: 'Account 1',
            address: '0xC4966c0D659D99699BFD7EB54D8fafEE40e4a756',
          },
        },
      },
      NetworkController: {
        ...mockNetworkState({
          id: 'mainnet',
          nickname: 'Ethereum',
          ticker: 'ETH',
          chainId: '0x1',
          type: RpcEndpointType.Infura,
        }),
      },
    },
  },
};

jest.mock('../../../store', () => ({
  store: {
    getState: () => mockInitialState,
  },
}));

describe('AccountApproval', () => {
  it('should render correctly', () => {
    const container = renderWithProvider(
      <AccountApproval
        currentPageInformation={{ icon: '', url: '', title: '' }}
      />,
      { state: mockInitialState },
    );

    expect(container).toMatchSnapshot();
  });

  it('should render a warning banner if the hostname is included in phishing list', () => {
    const { getByText } = renderWithProvider(
      <AccountApproval
        currentPageInformation={{ icon: '', url: 'phishing.com', title: '' }}
      />,
      { state: mockInitialState },
    );

    expect(getByText('Deceptive site ahead')).toBeTruthy();
  });
});
