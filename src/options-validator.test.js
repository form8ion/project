import joi from 'joi';
import * as core from '@form8ion/core';

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import languagePluginsSchema from './language/schema.js';
import vcsHostPluginsSchema from './vcs/host/schema.js';
import dependencyUpdaterPluginsSchema from './dependency-updater/schema.js';
import {validate} from './options-validator.js';

vi.mock('@form8ion/core', async () => ({
  validateOptions: vi.fn(),
  optionsSchemas: {form8ionPlugin: joi.object()}
}));
vi.mock('./vcs/host/schema.js');

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
    when(joi.object)
      .calledWith({
        dependencyUpdaters: dependencyUpdaterPluginsSchema,
        languages: languagePluginsSchema,
        vcsHosts: vcsHostPluginsSchema
      })
      .thenReturn(pluginsSchema);
    when(joi.object).calledWith({plugins: pluginsSchema}).thenReturn(fullSchema);
    when(core.validateOptions).calledWith(fullSchema, options).thenReturn(validatedOptions);

    expect(validate(options)).toEqual(validatedOptions);
  });
});
