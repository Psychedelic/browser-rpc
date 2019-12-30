import helloWorld, { UserInterface } from './index';

describe('helloWorld', () => {
  test('test hello world', () => {
    const user: UserInterface = {
      name: 'mr',
      lastName: 'developer',
    };

    const result = helloWorld(user);

    expect(result).toBe('Hello World: mr developer');
  });
});
