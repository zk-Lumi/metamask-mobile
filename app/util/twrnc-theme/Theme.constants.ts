// Third party dependencies
import { lightTheme, darkTheme } from '@metamask/design-tokens';

// Internal dependencies
import { TWRNCTheme } from './Theme.types';

export const themes = {
  [TWRNCTheme.Brand]: {
    light: lightTheme.colors,
    dark: darkTheme.colors,
  },
  [TWRNCTheme.BrandInverse]: {
    light: darkTheme.colors,
    dark: lightTheme.colors,
  },
};
