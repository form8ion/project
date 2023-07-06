import joi from 'joi';

export default joi.object().pattern(/^/, joi.func().arity(1));
