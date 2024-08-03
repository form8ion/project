import {validateOptions} from '@form8ion/core';

import {describe, expect, it} from 'vitest';
import any from '@travi/any';

import vcsHostSchema from './schema.js';

describe('vcs-host plugins schema', () => {
  const key = any.word();

  it('should return the validated options', () => {
    const options = any.objectWithKeys(
      any.listOf(any.string),
      {
        factory: () => ({
          scaffold: foo => foo,
          prompt: () => undefined,
          public: any.boolean(),
          private: any.boolean()
        })
      }
    );

    expect(validateOptions(vcsHostSchema, options)).toEqual(options);
  });

  it('should require options to be provided as an object', () => {
    expect(() => validateOptions(vcsHostSchema, {[key]: []}))
      .toThrowError(`"${key}" must be of type object`);
  });

  it('should require a `scaffolder` to be included', () => {
    expect(() => validateOptions(vcsHostSchema, {[key]: {}}))
      .toThrowError(`"${key}.scaffold" is required`);
  });

  it('should require `scaffolder` to be a function', () => {
    expect(() => validateOptions(vcsHostSchema, {[key]: {scaffold: any.word()}}))
      .toThrowError(`"${key}.scaffold" must be of type function`);
  });

  it('should require the scaffolder to accept a single argument', () => {
    expect(() => validateOptions(vcsHostSchema, {[key]: {scaffold: () => undefined}}))
      .toThrowError(`"${key}.scaffold" must have an arity of 1`);
  });
});
