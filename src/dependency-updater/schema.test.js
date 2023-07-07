import {validateOptions} from '@form8ion/core';

import {describe, expect, it} from 'vitest';
import any from '@travi/any';

import dependencyUpdaterPluginsSchema from './schema';

describe('dependency-updater plugins schema', () => {
  const key = any.word();

  it('should return the validated options', () => {
    const options = any.objectWithKeys(
      any.listOf(any.string),
      {factory: () => ({scaffolder: foo => foo})}
    );

    expect(validateOptions(dependencyUpdaterPluginsSchema, options)).toEqual(options);
  });

  it('should require options to be provided as an object', () => {
    expect(() => validateOptions(dependencyUpdaterPluginsSchema, {[key]: []}))
      .toThrowError(`"${key}" must be of type object`);
  });

  it('should require a `scaffolder` to be included', () => {
    expect(() => validateOptions(dependencyUpdaterPluginsSchema, {[key]: {}}))
      .toThrowError(`"${key}.scaffolder" is required`);
  });

  it('should require `scaffolder` to be a function', () => {
    expect(() => validateOptions(dependencyUpdaterPluginsSchema, {[key]: {scaffolder: any.word()}}))
      .toThrowError(`"${key}.scaffolder" must be of type function`);
  });

  it('should require the scaffolder to accept a single argument', () => {
    expect(() => validateOptions(dependencyUpdaterPluginsSchema, {[key]: {scaffolder: () => undefined}}))
      .toThrowError(`"${key}.scaffolder" must have an arity of 1`);
  });

  it('should default to an empty map when no updaters are provided', () => {
    expect(validateOptions(dependencyUpdaterPluginsSchema)).toEqual({});
  });
});
