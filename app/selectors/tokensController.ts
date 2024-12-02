import { Hex } from '@metamask/utils';
import { createSelector } from 'reselect';
import { TokensControllerState, Token } from '@metamask/assets-controllers';
import { RootState } from '../reducers';
import { createDeepEqualSelector } from './util';
import { selectSelectedInternalAccountAddress } from './accountsController';
import { selectChainId } from './networkController';

const selectTokensControllerState = (state: RootState) =>
  state?.engine?.backgroundState?.TokensController;

export const selectTokens = createDeepEqualSelector(
  selectTokensControllerState,
  (tokensControllerState: TokensControllerState) =>
    tokensControllerState?.tokens,
);

export const selectTokensByChainIdAndAddress = createDeepEqualSelector(
  selectTokensControllerState,
  selectChainId,
  selectSelectedInternalAccountAddress,
  (
    tokensControllerState: TokensControllerState,
    chainId: Hex,
    selectedAddress: string | undefined,
  ) => tokensControllerState?.allTokens[chainId]?.[selectedAddress as Hex],
);

export const selectTokensByAddress = createSelector(
  selectTokens,
  (tokens: Token[]) =>
    tokens.reduce((tokensMap: { [address: string]: Token }, token: Token) => {
      tokensMap[token.address] = token;
      return tokensMap;
    }, {}),
);

export const selectTokensLength = createSelector(
  selectTokens,
  (tokens: Token[]) => tokens.length,
);

export const selectIgnoreTokens = createSelector(
  selectTokensControllerState,
  (tokensControllerState: TokensControllerState) =>
    tokensControllerState?.ignoredTokens,
);

export const selectDetectedTokens = createSelector(
  selectTokensControllerState,
  (tokensControllerState: TokensControllerState) =>
    tokensControllerState?.detectedTokens,
);

export const selectAllTokens = createSelector(
  selectTokensControllerState,
  (tokensControllerState: TokensControllerState) =>
    tokensControllerState?.allTokens,
);

// @ts-expect-error TODO: Resolve mismatch between base-controller versions.
export const selectAllDetectedTokensForSelectedAddress = createSelector(
  selectTokensControllerState,
  selectSelectedInternalAccountAddress,
  (
    tokensControllerState: TokensControllerState,
    selectedAddress: Hex | null,
  ) => {
    // Updated return type to specify the structure more clearly
    if (!selectedAddress) {
      return {} as { [chainId: Hex]: Token[] }; // Specify return type
    }

    return Object.entries(
      tokensControllerState?.allDetectedTokens || {},
    ).reduce<{
      [chainId: Hex]: Token[];
    }>((acc, [chainId, chainTokens]) => {
      const tokensForAddress = chainTokens[selectedAddress] || [];
      if (tokensForAddress.length > 0) {
        acc[chainId as Hex] = tokensForAddress.map((token: Token) => ({
          ...token,
          chainId,
        }));
      }
      return acc;
    }, {});
  },
);

// TODO: This isn't working fully, once a network has been selected then it
// can detect all tokens in that network. But by default it only shows
// detected tokens if the user has chosen it in the past
export const selectAllDetectedTokensFlat = createSelector(
  selectAllDetectedTokensForSelectedAddress,
  (detectedTokensByChain: { [chainId: string]: Token[] }) => {
    if (Object.keys(detectedTokensByChain).length === 0) {
      return [];
    }

    const flattenedTokens: (Token & { chainId: Hex })[] = [];

    for (const [chainId, addressTokens] of Object.entries(
      detectedTokensByChain,
    )) {
      for (const token of addressTokens) {
        flattenedTokens.push({
          ...token,
          chainId: chainId as Hex,
        });
      }
    }

    return flattenedTokens;
  },
);

export const selectAllTokensFlat = createSelector(
  selectAllTokens,
  (tokensByAccountByChain: {
    [account: string]: { [chainId: string]: Token[] };
  }): Token[] => {
    if (Object.values(tokensByAccountByChain).length === 0) {
      return [];
    }
    const tokensByAccountArray = Object.values(tokensByAccountByChain);

    return tokensByAccountArray.reduce<Token[]>((acc, tokensByAccount) => {
      const tokensArray = Object.values(tokensByAccount).flat();
      return acc.concat(...tokensArray);
    }, []);
  },
);
