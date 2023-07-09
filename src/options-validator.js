import {validateOptions} from '@form8ion/core';
import joi from 'joi';

import languagePluginsSchema from './language/schema.js';
import vcsHostPluginsSchema from './vcs/host/schema.js';
import dependencyUpdaterPluginsSchema from './dependency-updater/schema.js';
import {decisionsSchema} from './options-schemas.js';

export function validate(options) {
  return validateOptions(joi.object({
    languages: languagePluginsSchema,
    vcsHosts: vcsHostPluginsSchema,
    decisions: decisionsSchema,
    dependencyUpdaters: dependencyUpdaterPluginsSchema
  }), options) || {};
}
