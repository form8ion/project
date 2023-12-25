import {resolve} from 'node:path';

import {describe, expect, it} from 'vitest';
import any from '@travi/any';

import determinePathToTemplateFile from './template-path.js';

describe('path to templates', () => {
  it('should provide the proper path to a template file', () => {
    const fileName = any.string();

    expect(determinePathToTemplateFile(fileName)).toEqual(resolve(__dirname, '..', 'templates', fileName));
  });
});
