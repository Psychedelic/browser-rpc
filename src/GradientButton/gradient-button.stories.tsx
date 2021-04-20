import React from 'react';

import GradientButton from './index';

export default {
  title: 'GradientButton',
  component: GradientButton,
};

const Template = (args) => <GradientButton {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: 'Text',
};
