import React from 'react';
import PropTypes from 'prop-types';
import Button, { ButtonProps } from '@material-ui/core/Button';

import useStyles from './styles';

export interface GradientButtonProps extends ButtonProps {
  inclination?: '45deg' | '90deg' | '180deg';
}

const GradientButton: React.FC<GradientButtonProps> = (props) => {
  const classes = useStyles(props);
  const { children, ...restProps } = props;

  return (
    <Button className={classes.root} {...restProps}>
      {children}
    </Button>
  );
};

GradientButton.defaultProps = {
  inclination: '45deg',
};

GradientButton.propTypes = {
  inclination: PropTypes.oneOf([
    '45deg',
    '90deg',
    '180deg',
  ]),
};

export default GradientButton;
