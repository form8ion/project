import {fileExists} from '@form8ion/core';

import {when} from 'jest-when';
import {expect, it, describe, vi} from 'vitest';
import any from '@travi/any';

import projectIsLicensed from './tester.js';

vi.mock('@form8ion/core');

describe('license predicate', () => {
  const projectRoot = any.string();

  it('should return `true` when a `LICENSE` file exists', async () => {
    when(fileExists).calledWith(`${projectRoot}/LICENSE`).mockResolvedValue(true);

    expect(await projectIsLicensed({projectRoot})).toBe(true);
  });

  it('should return `false` when a `LICENSE` does not file exist', async () => {
    when(fileExists).calledWith(`${projectRoot}/LICENSE`).mockResolvedValue(false);

    expect(await projectIsLicensed({projectRoot})).toBe(false);
  });
});
