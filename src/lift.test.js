import * as core from '@form8ion/core';
import * as readme from '@form8ion/readme';
import * as gitPlugin from '@form8ion/git';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import * as licensePlugin from './license/index.js';
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
    const dependencies = any.simpleObject();
    const vcs = any.simpleObject();
    const results = any.simpleObject();
    const enhancerResults = any.simpleObject();
    when(core.applyEnhancers)
      .calledWith({
        results,
        enhancers: {...enhancers, gitPlugin, licensePlugin},
        options: {projectRoot, vcs},
        dependencies
      })
      .thenResolve(enhancerResults);

    expect(await lift({projectRoot, results, enhancers, vcs, dependencies})).toEqual(enhancerResults);
    expect(readme.lift).toHaveBeenCalledWith({projectRoot, results: enhancerResults});
  });
});
