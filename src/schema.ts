import Validator, { ValidationSchema } from 'fastest-validator';

const validator = new Validator();

const messageSchema: ValidationSchema = {
  target: 'string',
  data: {
    type: 'object',
    props: {
      name: 'string',
      data: {
        type: 'object',
        props: {
          id: ['string', 'number'],
          jsonrpc: { type: 'equal', value: '2.0' },
          result: { type: 'any', optional: true },
          error: { type: 'object', optional: true },
          method: { type: 'string', optional: true },
          params: { type: 'array', optional: true, items: 'any' }
        },
      },
    },
  },
};

const validateMessageObject = validator.compile(messageSchema);
export default validateMessageObject;
