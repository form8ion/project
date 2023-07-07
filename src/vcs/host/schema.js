import joi from 'joi';

export default joi.object().pattern(/^/, joi.object({
  scaffolder: joi.func().arity(1).required(),
  prompt: joi.func().required(),
  public: joi.bool(),
  private: joi.bool()
}));
