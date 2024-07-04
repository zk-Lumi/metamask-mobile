// Third party dependencies.
import React from 'react';
import { render, screen } from '@testing-library/react-native';

// External dependencies.
import { IconName, IconProps, IconSize } from '../../Icons/Icon';
import { TextVariant } from '../Text/Text.types';

// Internal dependencies.
import TextWithPrefixIcon from './TextWithPrefixIcon';
import {
  TEST_SAMPLE_TEXT,
  TEXT_WITH_PREFIX_ICON_TEST_ID,
  TEXT_WITH_PREFIX_ICON_ICON_TEST_ID,
  TEXT_WITH_PREFIX_ICON_TEXT_TEST_ID,
} from './TextWithPrefixIcon.constants';

const sampleIconProps: IconProps = {
  name: IconName.Add,
};

describe('TextWithPrefixIcon - Snapshot', () => {
  it('should render default settings correctly', () => {
    const { toJSON } = render(
      <TextWithPrefixIcon
        variant={TextVariant.HeadingSMRegular}
        iconProps={sampleIconProps}
      >
        {TEST_SAMPLE_TEXT}
      </TextWithPrefixIcon>,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('TextWithPrefixIcon', () => {
  it('should render TextWithPrefixIcon', () => {
    render(
      <TextWithPrefixIcon
        variant={TextVariant.HeadingSMRegular}
        iconProps={sampleIconProps}
      >
        {TEST_SAMPLE_TEXT}
      </TextWithPrefixIcon>,
    );
    const TextWithPrefixIconComponent = screen.getByTestId(
      TEXT_WITH_PREFIX_ICON_TEST_ID,
    );
    expect(TextWithPrefixIconComponent).toBeTruthy();
  });
  it('should render the given icon name and size', () => {
    const testIconName = IconName.Bank;
    const testIconSize = IconSize.Xss;
    sampleIconProps.name = testIconName;
    sampleIconProps.size = testIconSize;
    render(
      <TextWithPrefixIcon
        variant={TextVariant.HeadingSMRegular}
        iconProps={sampleIconProps}
      >
        {TEST_SAMPLE_TEXT}
      </TextWithPrefixIcon>,
    );
    const iconElement = screen.getByTestId(TEXT_WITH_PREFIX_ICON_ICON_TEST_ID);
    expect(iconElement.props.name).toBe(testIconName);
    expect(iconElement.props.size).toBe(testIconSize);
  });
  it('should render the given text with the appropriate variant', () => {
    const testTextVariant = TextVariant.BodySM;
    render(
      <TextWithPrefixIcon variant={testTextVariant} iconProps={sampleIconProps}>
        {TEST_SAMPLE_TEXT}
      </TextWithPrefixIcon>,
    );
    const titleElement = screen.getByTestId(TEXT_WITH_PREFIX_ICON_TEXT_TEST_ID);
    expect(titleElement.props.children).toBe(TEST_SAMPLE_TEXT);
    expect(titleElement.props.variant).toBe(testTextVariant);
  });
});
