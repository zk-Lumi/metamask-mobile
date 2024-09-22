import { renderScreen } from '../../../../util/test/renderWithProvider';
import NetworksSettings from './';
import { backgroundState } from '../../../../util/test/initial-root-state';
import { mockNetworkState } from '../../../../util/test/network';
import { CHAIN_IDS } from '@metamask/transaction-controller';
import { RpcEndpointType } from '@metamask/network-controller';

const mockInitialState = {
  settings: {},
  engine: {
    backgroundState: {
      ...backgroundState,
      NetworkController: {
        ...mockNetworkState({
          id: 'mainnet',
          nickname: 'Ethereum Mainnet',
          ticker: 'ETH',
          chainId: CHAIN_IDS.MAINNET,
          type: RpcEndpointType.Infura,
        }),
      },
    },
  },
};

jest.mock('../../../../store', () => ({
  store: {
    getState: () => mockInitialState,
  },
}));

describe('NetworksSettings', () => {
  it('should render correctly', () => {
    const { toJSON } = renderScreen(
      NetworksSettings,
      { name: 'Network Settings' },
      {
        state: mockInitialState,
      },
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
