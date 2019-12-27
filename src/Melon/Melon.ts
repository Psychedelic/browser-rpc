export enum MelonType {
  waterMelon = 'WATER_MELON',
  melon = 'MELON',
};

export enum MelonSize {
  large = 'L',
  extraLarge = 'XL',
  extraExtraLarge = 'XXL',
}

export interface Melon {
  age: number;
  origin: string;
  type: MelonType;
  size: MelonSize;
};

export default (melon: Melon): void => {
  const melonString = JSON.stringify(melon);

  console.log('this is your melon:', melonString);
};
