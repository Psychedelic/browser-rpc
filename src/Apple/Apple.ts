export enum AppleType {
  red = 'RED',
  green = 'GREEN',
}

export enum AppleSize {
  small = 'S',
  medium = 'M',
  large = 'L',
}

export interface Apple {
  type: AppleType;
  size: AppleSize;
  origin: string;
  age: number;
}

export default (apple: Apple): void => {
  const jsonString = JSON.stringify(apple);

  console.log('this is your apple:', jsonString);
};
