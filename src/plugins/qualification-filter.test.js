import {describe, it, expect, vi, beforeEach} from 'vitest';
import {when} from 'vitest-when';
import any from '@travi/any';

import filterToQualifiedPlugins from './qualification-filter.js';

describe('qualification filter', () => {
  const projectRoot = any.string();
  const qualifiedProviderName = any.word();
  const unqualifiedProviderName = any.word();
  const qualifiedPlugin = {qualify: vi.fn()};
  const unqualifiedPlugin = {qualify: vi.fn()};

  beforeEach(() => {
    when(qualifiedPlugin.qualify).calledWith({projectRoot}).thenResolve(true);
    when(unqualifiedPlugin.qualify).calledWith({projectRoot}).thenResolve(false);
  });

  it('should filter the list of plugins based on their `qualify` predicate', async () => {
    const plugins = {[qualifiedProviderName]: qualifiedPlugin, [unqualifiedProviderName]: unqualifiedPlugin};

    expect(await filterToQualifiedPlugins({plugins, projectRoot})).toEqual({[qualifiedProviderName]: qualifiedPlugin});
  });

  it('should treat a plugin without a qualify method as always qualifying', async () => {
    const simplePlugin = any.simpleObject();
    const simplePluginName = any.word();
    const plugins = {
      [qualifiedProviderName]: qualifiedPlugin,
      [unqualifiedProviderName]: unqualifiedPlugin,
      [simplePluginName]: simplePlugin
    };

    expect(await filterToQualifiedPlugins({plugins, projectRoot})).toEqual({
      [qualifiedProviderName]: qualifiedPlugin,
      [simplePluginName]: simplePlugin
    });
  });
});
