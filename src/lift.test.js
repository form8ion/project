import * as core from '@form8ion/core';
import * as readme from '@form8ion/readme';
import * as gitPlugin from '@form8ion/git';

import {beforeEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import {scaffold as scaffoldEditorconfig, test as editorconfigInUse} from './editorconfig/index.js';
import * as licensePlugin from './license/index.js';
import lift from './lift.js';

vi.mock('deepmerge');
vi.mock('@form8ion/core');
vi.mock('@form8ion/readme');
vi.mock('./editorconfig/index.js');

describe('lift', () => {
  const projectRoot = any.string();
  const results = any.simpleObject();
  const enhancers = any.simpleObject();
  const vcs = any.simpleObject();
  const dependencies = any.simpleObject();
  const enhancerResults = any.simpleObject();

  beforeEach(() => {
    when(core.applyEnhancers)
      .calledWith({
        results,
        enhancers: {...enhancers, gitPlugin, licensePlugin},
        options: {projectRoot, vcs},
        dependencies
      })
      .thenResolve(enhancerResults);
  });

  it('should lift the README based on the provided results', async () => {
    when(editorconfigInUse).calledWith({projectRoot}).thenResolve(true);

    expect(await lift({projectRoot, results, enhancers, vcs, dependencies})).toEqual(enhancerResults);
    expect(readme.lift).toHaveBeenCalledWith({projectRoot, results: enhancerResults});
    expect(scaffoldEditorconfig).not.toHaveBeenCalled();
  });

  it('should scaffold editorconfig when it isnt already in use', async () => {
    when(editorconfigInUse).calledWith({projectRoot}).thenResolve(false);

    await lift({projectRoot, results, enhancers, vcs, dependencies});

    expect(scaffoldEditorconfig).toHaveBeenCalledWith({projectRoot});
  });
});
