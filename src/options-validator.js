import * as joi from '@hapi/joi';
import hoek from '@hapi/hoek';

export function validate(options) {
  const schema = joi.object({
    languages: joi.object().pattern(/^/, joi.func().arity(1)),
    overrides: joi.object({copyrightHolder: joi.string()}),
    vcsHosts: joi.object().pattern(/^/, joi.object({
      scaffolder: joi.func().arity(1).required(),
      prompt: joi.func().required(),
      public: joi.boolean(),
      private: joi.boolean()
    })),
    answers: joi.object()
  });
  const validated = schema.validate(options);

  hoek.assert(!validated.error, validated.error);

  return validated.value || {};
}
