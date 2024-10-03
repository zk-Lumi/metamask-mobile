import React from 'react';
import ThemeProvider from '../../app/component-library/providers/ThemeProvider/ThemeProvider';
import {
  TWRNCThemeProvider,
  TWRNCTheme,
  ColorScheme,
} from '../../app/util/twrnc-theme';

const withTheme = (storyFn: () => React.ReactNode) => (
  <ThemeProvider>
    <TWRNCThemeProvider
      theme={TWRNCTheme.Brand}
      colorScheme={ColorScheme.Themed}
    >
      {storyFn()}
    </TWRNCThemeProvider>
  </ThemeProvider>
);

export default withTheme;
