export interface UserInterface {
  name: string;
  lastName: string;
}

const helloWorld = (user: UserInterface): string => {
  const { name, lastName } = user;
  const text = `Hello World: ${name} ${lastName}`;

  return text;
};

export default helloWorld;
