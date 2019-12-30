import React from 'react';
import { select, text } from '@storybook/addon-knobs';

import GradientButton, { GradientButtonProps } from './GradientButton';

export default { title: 'GradientButton' };

export const withText = () => {
  const defaultProps: GradientButtonProps = {
    children: text('children', 'Some Text'),
    inclination: select('inclination', [
      '45deg',
      '90deg',
      '180deg',
    ], '45deg'),
  };

  return (
    <GradientButton {...defaultProps} />
  );
};
