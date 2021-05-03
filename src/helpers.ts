import schema from './schema';
import { ValidationMessageObject } from './types';

export const validateMessageSchema = (message: any): ValidationMessageObject => {
  const result = schema.validate(message);

  if (result.error) return { isValid: false, type: null };

  let type: ValidationMessageObject['type'] = null;

  if (
    message.data.data.hasOwnProperty('method')
    && message.data.data.hasOwnProperty('params')
  ) {
    type = 'req';
  } else if (
    message.data.data.hasOwnProperty('result')
    || message.data.data.hasOwnProperty('error')
  ) {
    type = 'res';
  }

  return {
    type,
    isValid: (type === 'req' || type === 'res'),
  };
}
