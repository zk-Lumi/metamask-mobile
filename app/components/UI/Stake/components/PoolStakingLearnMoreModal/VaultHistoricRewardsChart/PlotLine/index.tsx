import React from 'react';
import { Path } from 'react-native-svg';
import { useTheme } from '../../../../../../../util/theme';

interface LineProps {
  line: string;
  doesChartHaveData: boolean;
  color?: string;
}

const PlotLine = ({ line, doesChartHaveData, color }: Partial<LineProps>) => {
  const { colors: themeColors } = useTheme();

  const defaultColor = themeColors.success.default;

  const lineColor = color ?? defaultColor;

  return (
    <Path
      key="line"
      d={line}
      stroke={doesChartHaveData ? lineColor : themeColors.text.alternative}
      strokeWidth={1.5}
      fill="none"
      opacity={doesChartHaveData ? 1 : 0.85}
    />
  );
};

export default PlotLine;
