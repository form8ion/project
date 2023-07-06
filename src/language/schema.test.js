import {validateOptions} from '@form8ion/core';

import {describe, expect, it} from 'vitest';
import any from '@travi/any';

import languageSchema from './schema';

describe('languages schema', () => {
  const key = any.word();

  it('should return the validated options', () => {
    const options = {};

    expect(validateOptions(languageSchema, options)).toEqual(options);
  });

  it('should require a scaffold function to be included', () => {
    expect(() => validateOptions(languageSchema, {[key]: any.word()}))
      .toThrowError(`"${key}" must be of type function`);
  });

  it('should require the scaffolder to accept a single argument', () => {
    expect(() => validateOptions(languageSchema, {[key]: () => undefined}))
      .toThrowError(`"${key}" must have an arity of 1`);
  });
});
