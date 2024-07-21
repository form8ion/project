import joi from 'joi';
import {validateOptions, form8ionPlugin} from '@form8ion/core';

import {describe, expect, it, beforeEach, afterEach, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import languagePluginsSchema from './language/schema.js';
import {decisionsSchema} from './options-schemas.js';
import vcsHostPluginsSchema from './vcs/host/schema.js';
import dependencyUpdaterPluginsSchema from './dependency-updater/schema.js';
import {validate} from './options-validator.js';

vi.mock('@form8ion/core');

describe('options validator', () => {
  beforeEach(() => {
    vi.spyOn(joi, 'object');
    vi.spyOn(joi, 'string');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should build the full schema and call the base validator', () => {
    const options = any.simpleObject();
    const pluginsSchema = any.simpleObject();
    const pluginMapSchema = any.simpleObject();
    const fullSchema = any.simpleObject();
    const validatedOptions = any.simpleObject();
    const joiPattern = vi.fn();
    const stringSchema = any.simpleObject();
    joi.string.mockReturnValue(stringSchema);
    when(joiPattern).calledWith(stringSchema, form8ionPlugin).mockReturnValue(pluginMapSchema);
    when(joi.object).calledWith().mockReturnValue({pattern: joiPattern});
    when(joi.object).calledWith({dependencyUpdaters: pluginMapSchema}).mockReturnValue(pluginsSchema);
    when(joi.object).calledWith({
      languages: languagePluginsSchema,
      vcsHosts: vcsHostPluginsSchema,
      decisions: decisionsSchema,
      dependencyUpdaters: dependencyUpdaterPluginsSchema,
      plugins: pluginsSchema
    }).mockReturnValue(fullSchema);
    when(validateOptions).calledWith(fullSchema, options).mockReturnValue(validatedOptions);

    expect(validate(options)).toEqual(validatedOptions);
  });
});
