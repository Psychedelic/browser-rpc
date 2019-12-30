import React from 'react';
import renderer, {
  ReactTestRenderer,
  ReactTestInstance,
} from 'react-test-renderer';

import GradientButton from './GradientButton';

describe('GradientButton', () => {
  let component: ReactTestRenderer;
  let testInstance: ReactTestInstance;
  const text = 'Some Text';

  beforeEach(() => {
    component = renderer.create(
      <GradientButton>
        {text}
      </GradientButton>,
    );

    testInstance = component.root;
  });

  it('should display text string inside button', () => {
    expect(testInstance.findByType(GradientButton).props.children).toBe(text);
  });

  it('should add default value for inclination prop', () => {
    expect(testInstance.findByType(GradientButton).props.inclination)
      .toBe('45deg');
  });

  it('should match stapshot', () => {
    const tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
});
