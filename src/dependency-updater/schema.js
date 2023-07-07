import joi from 'joi';

export default joi.object().pattern(/^/, joi.object({
  scaffolder: joi.func().arity(1).required()
})).default({});
