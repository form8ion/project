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
      .toThrow(`"${key}" must be of type object`);
  });

  it('should require `scaffold` to be a function', () => {
    expect(() => validateOptions(vcsHostSchema, {[key]: {scaffold: any.word()}}))
      .toThrow(`"${key}.scaffold" must be of type function`);
  });

  it('should require the scaffold to accept a single argument', () => {
    expect(() => validateOptions(vcsHostSchema, {[key]: {scaffold: () => undefined}}))
      .toThrow(`"${key}.scaffold" must have an arity greater or equal to 1`);
  });
});
