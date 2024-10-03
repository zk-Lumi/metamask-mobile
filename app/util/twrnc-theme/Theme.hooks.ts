// Third party dependencies
import { useContext } from 'react';

// Internal dependencies
import { TWRNCThemeContext } from './Theme.providers';

export const useTailwind = () => {
  const { tw } = useContext(TWRNCThemeContext);
  return tw;
};
