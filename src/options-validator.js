import {validateOptions} from '@form8ion/core';
import joi from 'joi';

import languagePluginsSchema from './language/schema';
import vcsHostPluginsSchema from './vcs/host/schema';
import dependencyUpdaterPluginsSchema from './dependency-updater/schema';

export function validate(options) {
  return validateOptions(joi.object({
    languages: languagePluginsSchema,
    overrides: joi.object({copyrightHolder: joi.string()}),
    vcsHosts: vcsHostPluginsSchema,
    decisions: joi.object(),
    dependencyUpdaters: dependencyUpdaterPluginsSchema
  }), options) || {};
}
