import {describe, it, expect, vi, afterEach} from 'vitest';
import any from '@travi/any';

import writeIgnores from './writer.js';
import liftGitIgnore from './lifter.js';

vi.mock('./writer.js');

describe('gitignore lifter', () => {
  const projectRoot = any.string();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should write the provided ignores to the gitignore file', async () => {
    const ignoredDirectories = any.listOf(any.word);
    const ignoredFiles = any.listOf(any.word);

    expect(
      await liftGitIgnore({projectRoot, results: {vcsIgnore: {directories: ignoredDirectories, files: ignoredFiles}}})
    ).toEqual({});

    expect(writeIgnores).toHaveBeenCalledWith({projectRoot, directories: ignoredDirectories, files: ignoredFiles});
  });

  it('should not update the ignore file if no additional ignores are provided', async () => {
    expect(await liftGitIgnore({projectRoot, results: {}})).toEqual({});

    expect(writeIgnores).not.toHaveBeenCalledWith({projectRoot});
  });
});
