import React from 'react';
import PropTypes from 'prop-types';

export enum AppleType {
  red = 'RED',
  green = 'GREEN',
}

export enum AppleSize {
  small = 'S',
  medium = 'M',
  large = 'L',
}

export interface AppleInterface {
  type: AppleType;
  size: AppleSize;
  origin: string;
  age: number;
}

export interface AppleProps {
  apple: AppleInterface;
}

export type AppleTestType = {
  age: number;
  name: string;
}

const Apple: React.FC<AppleProps> = (props) => {
  const { apple } = props;

  return (
    <div>
      {JSON.stringify(apple)}
    </div>
  );
};

Apple.propTypes = {
  apple: PropTypes.shape({
    origin: PropTypes.string.isRequired,
    age: PropTypes.number.isRequired,
    size: PropTypes.oneOf([
      AppleSize.small,
      AppleSize.medium,
      AppleSize.large,
    ]).isRequired,
    type: PropTypes.oneOf([
      AppleType.red,
      AppleType.green,
    ]).isRequired,
  }).isRequired,
};

export default Apple;
