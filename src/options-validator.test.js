import joi from 'joi';
import {validateOptions} from '@form8ion/core';

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
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
    const fullSchema = any.simpleObject();
    const validatedOptions = any.simpleObject();
    when(joi.object).calledWith({dependencyUpdaters: dependencyUpdaterPluginsSchema}).mockReturnValue(pluginsSchema);
    when(joi.object).calledWith({
      languages: languagePluginsSchema,
      vcsHosts: vcsHostPluginsSchema,
      decisions: decisionsSchema,
      plugins: pluginsSchema
    }).mockReturnValue(fullSchema);
    when(validateOptions).calledWith(fullSchema, options).mockReturnValue(validatedOptions);

    expect(validate(options)).toEqual(validatedOptions);
  });
});
