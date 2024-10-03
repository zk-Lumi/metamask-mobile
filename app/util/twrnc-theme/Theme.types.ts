import { create } from 'twrnc';

export enum TWRNCTheme {
  Brand = 'brand',
  BrandInverse = 'brandInverse',
}

export enum ColorScheme {
  Light = 'light',
  Dark = 'Dark',
  Themed = 'Themed',
}

export interface ThemeContextProps {
  tw: ReturnType<typeof create>;
  theme: TWRNCTheme;
  colorScheme: ColorScheme;
  setTheme: (theme: TWRNCTheme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: TWRNCTheme;
  colorScheme?: ColorScheme;
}
