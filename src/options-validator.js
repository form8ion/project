import {validateOptions} from '@form8ion/core';
import joi from 'joi';

import languagePluginsSchema from './language/schema';
import vcsHostPluginsSchema from './vcs/host/schema';
import dependencyUpdaterPluginsSchema from './dependency-updater/schema';
import {decisionsSchema, overridesSchema} from './options-schemas';

export function validate(options) {
  return validateOptions(joi.object({
    languages: languagePluginsSchema,
    overrides: overridesSchema,
    vcsHosts: vcsHostPluginsSchema,
    decisions: decisionsSchema,
    dependencyUpdaters: dependencyUpdaterPluginsSchema
  }), options) || {};
}
