import Joi from 'joi';

const schema = Joi.object({
  target: Joi.string().required(),
  data: Joi.object({
    name: Joi.string().required(),
    data: Joi.object({
      id: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
      jsonrpc: Joi.string().valid('2.0').required(),
      result: Joi.any(),
      method: Joi.string(),
      params: Joi.array().items(Joi.any()),
      error: Joi.object({
        code: Joi.number().required(),
        message: Joi.string().required(),
        data: Joi.any(),
      }),
    }).required(),
  }).required(),
});

export default schema;
