import { configure, addDecorator } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs/react';

addDecorator(withKnobs({ escapeHTML: false }));

configure(
  require.context('../src', true, /\.stories\.tsx?$/),
  module,
);
