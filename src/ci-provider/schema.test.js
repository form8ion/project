import {validateOptions} from '@form8ion/core';

import {describe, expect, it} from 'vitest';
import any from '@travi/any';

import ciProviderPluginsSchema from './schema.js';

describe('ci-provider plugins schema', () => {
  const key = any.word();

  it('should return the validated options', () => {
    const options = any.objectWithKeys(
      any.listOf(any.string),
      {factory: () => ({scaffold: foo => foo})}
    );

    expect(validateOptions(ciProviderPluginsSchema, options)).toEqual(options);
  });

  it('should require options to be provided as an object', () => {
    expect(() => validateOptions(ciProviderPluginsSchema, {[key]: []}))
      .toThrowError(`"${key}" must be of type object`);
  });

  it('should require a `scaffold` property to be included', () => {
    expect(() => validateOptions(ciProviderPluginsSchema, {[key]: {}}))
      .toThrowError(`"${key}.scaffold" is required`);
  });

  it('should require `scaffold` to be a function', () => {
    expect(() => validateOptions(ciProviderPluginsSchema, {[key]: {scaffold: any.word()}}))
      .toThrowError(`"${key}.scaffold" must be of type function`);
  });

  it('should require the scaffolder to accept a single argument', () => {
    expect(() => validateOptions(ciProviderPluginsSchema, {[key]: {scaffold: () => undefined}}))
      .toThrowError(`"${key}.scaffold" must have an arity greater or equal to 1`);
  });

  it('should default to an empty map when no updaters are provided', () => {
    expect(validateOptions(ciProviderPluginsSchema)).toEqual({});
  });
});
