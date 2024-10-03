/* eslint-disable no-empty-function */
// Third party dependencies
import React, { createContext, useState, useMemo } from 'react';
import { create } from 'twrnc';

// External dependencies
import { useAppTheme } from '../theme';

// Internal dependencies
import { generateTailwindConfig } from './Theme.utilities';
import {
  TWRNCTheme,
  ColorScheme,
  ThemeContextProps,
  ThemeProviderProps,
} from './Theme.types';

export const TWRNCThemeContext = createContext<ThemeContextProps>({
  tw: create({}),
  theme: TWRNCTheme.Brand,
  colorScheme: ColorScheme.Themed,
  setTheme: () => {},
  setColorScheme: () => {},
});

export const TWRNCThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme = TWRNCTheme.Brand,
  colorScheme = ColorScheme.Themed,
}) => {
  const [currentTheme, setCurrentTheme] = useState<TWRNCTheme>(theme);
  const [currentColorScheme, setCurrentColorScheme] =
    useState<ColorScheme>(colorScheme);

  const systemColorScheme = useAppTheme().themeAppearance;

  const activeColorScheme: 'light' | 'dark' = useMemo(() => {
    if (currentColorScheme === ColorScheme.Themed) {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return currentColorScheme as 'light' | 'dark';
  }, [currentColorScheme, systemColorScheme]);

  const tw = useMemo(() => {
    const tailwindConfig = generateTailwindConfig(
      currentTheme,
      activeColorScheme,
    );
    return create(tailwindConfig);
  }, [currentTheme, activeColorScheme]);

  return (
    <TWRNCThemeContext.Provider
      value={{
        tw,
        theme: currentTheme,
        colorScheme: currentColorScheme,
        setTheme: setCurrentTheme,
        setColorScheme: setCurrentColorScheme,
      }}
    >
      {children}
    </TWRNCThemeContext.Provider>
  );
};
