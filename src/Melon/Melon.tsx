import React from 'react';
import PropTypes from 'prop-types';

export type MelonType = 'MELON' | 'WATER_MELON';

export enum MelonSize {
  large = 'L',
  extraLarge = 'XL',
  extraExtraLarge = 'XXL',
}

export interface MelonInterface {
  age: number;
  origin: string;
  type: MelonType;
  size: MelonSize;
}

const Melon: React.FC<MelonInterface> = (props) => {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { children, ...restProps } = props;

  return (
    <div>
      {JSON.stringify(restProps)}
    </div>
  );
};

Melon.propTypes = {
  age: PropTypes.number.isRequired,
  origin: PropTypes.string.isRequired,
  type: PropTypes.oneOf<MelonType>([
    'MELON',
    'WATER_MELON',
  ]).isRequired,
  size: PropTypes.oneOf<MelonSize>([
    MelonSize.large,
    MelonSize.extraLarge,
    MelonSize.extraExtraLarge,
  ]).isRequired,
};
