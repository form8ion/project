import {promises as fs} from 'node:fs';

import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';

import write from './writer.js';

vi.mock('node:fs');

describe('gitignore writer', () => {
  const projectRoot = any.string();

  it('should create the ignore file when patterns are defined', async () => {
    const directories = any.listOf(any.string);
    const files = any.listOf(any.string);

    await write({projectRoot, directories, files});

    expect(fs.appendFile).toHaveBeenCalledWith(
      `${projectRoot}/.gitignore`,
      `\n${directories.join('\n')}\n\n${files.join('\n')}`
    );
  });

  it('should not throw an error if directories nor files are provided', async () => {
    await write({projectRoot});

    expect(fs.appendFile).toHaveBeenCalledWith(`${projectRoot}/.gitignore`, '\n\n\n');
  });
});
