import {validateOptions} from '@form8ion/core';

import {describe, expect, it} from 'vitest';
import any from '@travi/any';

import {overridesSchema, decisionsSchema} from './options-schemas';

describe('generic options schemas', () => {
  describe('overrides', () => {
    it('should return the validated options', () => {
      const options = {copyrightHolder: any.string()};

      expect(validateOptions(overridesSchema, options)).toEqual(options);
    });

    it('should require the overrides to be defined as a map', () => {
      expect(() => validateOptions(overridesSchema, any.word())).toThrowError('must be of type object');
    });

    it('should require `copyrightHolder` to be a string', () => {
      expect(() => validateOptions(overridesSchema, {copyrightHolder: any.simpleObject()}))
        .toThrowError('must be a string');
    });
  });

  describe('decisions', () => {
    it('should return the validated options', () => {
      const options = any.simpleObject();

      expect(validateOptions(decisionsSchema, options)).toEqual(options);
    });

    it('should require the decisions to be defined as a map', () => {
      expect(() => validateOptions(decisionsSchema, any.word())).toThrowError('must be of type object');
    });
  });
});
