import joi from 'joi';
import * as hoek from '@hapi/hoek';

import languagePluginsSchema from './language/schema';
import vcsHostPluginsSchema from './vcs/host/schema';
import dependencyUpdaterPluginsSchema from './dependency-updater/schema';

export function validate(options) {
  const schema = joi.object({
    languages: languagePluginsSchema,
    overrides: joi.object({copyrightHolder: joi.string()}),
    vcsHosts: vcsHostPluginsSchema,
    decisions: joi.object(),
    dependencyUpdaters: dependencyUpdaterPluginsSchema
  });
  const validated = schema.validate(options);

  hoek.assert(!validated.error, validated.error);

  return validated.value || {};
}
