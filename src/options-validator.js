import * as joi from 'joi';
import hoek from 'hoek';

export function validate(options) {
  const validated = joi.validate(options, joi.object({
    languages: joi.object().pattern(/^/, joi.func().arity(1)),
    overrides: joi.object({copyrightHolder: joi.string()}),
    vcsHosts: joi.object().pattern(/^/, joi.object({
      scaffolder: joi.func().arity(1).required(),
      prompt: joi.func().required(),
      public: joi.boolean(),
      private: joi.boolean()
    }))
  }));

  hoek.assert(!validated.error, validated.error);

  return validated.value || {};
}
