import {validateOptions} from '@form8ion/core';

import {describe, expect, it} from 'vitest';
import any from '@travi/any';

import vcsHostSchema from './schema';

describe('vcs-host plugins schema', () => {
  const key = any.word();

  it('should return the validated options', () => {
    const options = any.objectWithKeys(
      any.listOf(any.string),
      {
        factory: () => ({
          scaffolder: foo => foo,
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
      .toThrowError(`"${key}.scaffolder" is required`);
  });

  it('should require `scaffolder` to be a function', () => {
    expect(() => validateOptions(vcsHostSchema, {[key]: {scaffolder: any.word()}}))
      .toThrowError(`"${key}.scaffolder" must be of type function`);
  });

  it('should require the scaffolder to accept a single argument', () => {
    expect(() => validateOptions(vcsHostSchema, {[key]: {scaffolder: () => undefined}}))
      .toThrowError(`"${key}.scaffolder" must have an arity of 1`);
  });

  it('should require a `prompt` property', () => {
    expect(() => validateOptions(vcsHostSchema, {[key]: {scaffolder: foo => foo}}))
      .toThrowError(`"${key}.prompt" is required`);
  });

  it('should require the `prompt` to be a function', () => {
    expect(() => validateOptions(vcsHostSchema, {[key]: {scaffolder: foo => foo, prompt: any.word()}}))
      .toThrowError(`"${key}.prompt" must be of type function`);
  });

  it('should require the `public` property to be a boolean', () => {
    expect(() => validateOptions(
      vcsHostSchema,
      {[key]: {scaffolder: foo => foo, prompt: bar => bar, public: any.word()}}
    )).toThrowError(`"${key}.public" must be a boolean`);
  });

  it('should require the `private` property to be a boolean', () => {
    expect(() => validateOptions(
      vcsHostSchema,
      {[key]: {scaffolder: foo => foo, prompt: bar => bar, private: any.word()}}
    )).toThrowError(`"${key}.private" must be a boolean`);
  });
});
