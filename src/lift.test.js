import deepmerge from 'deepmerge';
import * as core from '@form8ion/core';
import * as readme from '@form8ion/readme';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import {lift as liftGitignore, test as gitIgnoreExists} from './vcs/git/ignore/index.js';
import lift from './lift.js';

vi.mock('deepmerge');
vi.mock('@form8ion/core');
vi.mock('@form8ion/readme');

describe('lift', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should lift the README based on the provided results', async () => {
    const projectRoot = any.string();
    const enhancers = any.simpleObject();
    const vcs = any.simpleObject();
    const results = any.simpleObject();
    const enhancerResults = any.simpleObject();
    const mergedResults = any.simpleObject();
    when(core.applyEnhancers)
      .calledWith({
        results,
        enhancers: {...enhancers, gitIgnore: {test: gitIgnoreExists, lift: liftGitignore}},
        options: {projectRoot, vcs}
      })
      .mockResolvedValue(enhancerResults);
    when(deepmerge.all).calledWith([results, enhancerResults]).mockReturnValue(mergedResults);

    expect(await lift({projectRoot, results, enhancers, vcs})).toEqual(enhancerResults);
    expect(readme.lift).toHaveBeenCalledWith({projectRoot, results: mergedResults});
  });
});
