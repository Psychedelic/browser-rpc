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
};

const Melon: React.FC<MelonInterface> = (props) => {
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

// export default (melon: MelonInterface): void => {
//   const melonString = JSON.stringify(melon);

//   console.log('this is your melon:', melonString);
// };



/* Using InferProps Example */

// const melonPropTypes = {
//   age: PropTypes.number.isRequired,
//   origin: PropTypes.string,
//   type: PropTypes.oneOf([
//     'MELON',
//     'WATER_MELON',
//   ]).isRequired,
//   size: PropTypes.oneOf([
//     'L',
//     'XL',
//     'XXL',
//   ]).isRequired,
// };

// type MelonProps = InferProps<typeof melonPropTypes>;

// const Melon: React.FC<MelonProps> = (props) => {
//   const { size } = props;

//   return (
//     <div>

//     </div>
//   );
// };

// Melon.propTypes = melonPropTypes;


// const anotherCompo = () => {
//   return (
//     <Melon size="" />
//   );
// };
