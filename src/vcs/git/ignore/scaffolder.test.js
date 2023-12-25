import {promises as fs} from 'node:fs';

import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';

import scaffold from './scaffolder.js';

vi.mock('node:fs');

describe('gitignore scaffolder', () => {
  const projectRoot = any.string();

  it('should create the ignore file when patterns are defined', async () => {
    const directories = any.listOf(any.string);
    const files = any.listOf(any.string);

    await scaffold({projectRoot, directories, files});

    expect(fs.writeFile).toHaveBeenCalledWith(
      `${projectRoot}/.gitignore`,
      `${directories.join('\n')}\n\n${files.join('\n')}`
    );
  });
});
