/* eslint-disable react/prop-types */

// Third party dependencies.
import React, { useCallback, useMemo, useState } from 'react';
import { GestureResponderEvent, TouchableOpacity } from 'react-native';

// External dependencies.
import Icon, { IconSize } from '../../Icon';
import { useStyles } from '../../../../component-library/hooks';

// Internal dependencies.
import { ButtonIconProps, ButtonIconVariant } from './ButtonIcon.types';
import stylesheet from './ButtonIcon.styles';

const ButtonIcon = ({
  iconName,
  variant = ButtonIconVariant.Primary,
  disabled,
  onPressIn,
  onPressOut,
  style,
  ...props
}: ButtonIconProps) => {
  const {
    styles,
    theme: { colors },
  } = useStyles(stylesheet, { style });
  const [pressed, setPressed] = useState(false);
  const iconColor = useMemo(() => {
    let color: string;
    if (disabled) {
      color = colors.icon.muted;
    } else {
      switch (variant) {
        case ButtonIconVariant.Primary:
          color = pressed ? colors.primary.alternative : colors.primary.default;
          break;
        case ButtonIconVariant.Secondary:
          color = pressed ? colors.icon.alternative : colors.icon.default;
          break;
      }
    }
    return color;
  }, [colors, variant, disabled, pressed]);

  const triggerOnPressedIn = useCallback(
    (e: GestureResponderEvent) => {
      setPressed(true);
      onPressIn?.(e);
    },
    [setPressed, onPressIn],
  );

  const triggerOnPressedOut = useCallback(
    (e: GestureResponderEvent) => {
      setPressed(false);
      onPressOut?.(e);
    },
    [setPressed, onPressOut],
  );

  return (
    <TouchableOpacity
      style={styles.base}
      onPressIn={triggerOnPressedIn}
      onPressOut={triggerOnPressedOut}
      activeOpacity={1}
      {...props}
    >
      <Icon name={iconName} size={IconSize.Lg} color={iconColor} />
    </TouchableOpacity>
  );
};

export default ButtonIcon;
