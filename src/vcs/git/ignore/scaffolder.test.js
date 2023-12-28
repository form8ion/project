import {promises as fs} from 'node:fs';

import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';

import scaffold from './scaffold.js';

vi.mock('node:fs');

describe('gitignore scaffolder', () => {
  const projectRoot = any.string();

  it('should create the ignore file when patterns are defined', async () => {
    await scaffold({projectRoot});

    expect(fs.writeFile).toHaveBeenCalledWith(`${projectRoot}/.gitignore`, '');
  });
});
