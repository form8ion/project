import {fileExists} from '@form8ion/core';

import {describe, it, vi, expect} from 'vitest';
import {when} from 'vitest-when';
import any from '@travi/any';

import editorconfigInUse from './tester.js';

vi.mock('@form8ion/core');

describe('editorconfig tester', () => {
  const projectRoot = any.string();

  it('should return `true` if an `.editorconfig` file exists', async () => {
    when(fileExists).calledWith(`${projectRoot}/.editorconfig`).thenResolve(true);

    expect(await editorconfigInUse({projectRoot})).toBe(true);
  });

  it('should return `false` if an `.editorconfig` file does not exist', async () => {
    when(fileExists).calledWith(`${projectRoot}/.editorconfig`).thenResolve(false);

    expect(await editorconfigInUse({projectRoot})).toBe(false);
  });
});
