import {validateOptions} from '@form8ion/core';

import {describe, expect, it} from 'vitest';
import any from '@travi/any';

import {decisionsSchema} from './options-schemas.js';

describe('generic options schemas', () => {
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
