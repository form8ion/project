import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import promptForCiProvider from './prompt.js';
import scaffoldCiProvider from './scaffolder.js';
import {questionNames} from '../prompts/index.js';

vi.mock('./prompt.js');

const {CI_PROVIDER} = questionNames.CI_PROVIDER;

describe('ci-provider scaffolder', () => {
  const prompt = () => undefined;
  const projectRoot = any.string();
  const options = {projectRoot};

  it('should qualify each plugin and prompt only with those that qualify', async () => {
    const qualifiedProviderName = any.word();
    const unqualifiedProviderName = any.word();
    const qualifiedScaffolder = vi.fn();
    const qualifiedPlugin = {qualify: vi.fn(), scaffold: qualifiedScaffolder};
    const unqualifiedPlugin = {qualify: vi.fn(), scaffold: vi.fn()};
    const scaffolderResult = any.simpleObject();
    when(qualifiedPlugin.qualify).calledWith({projectRoot}).thenResolve(true);
    when(unqualifiedPlugin.qualify).calledWith({projectRoot}).thenResolve(false);
    when(promptForCiProvider)
      .calledWith({[qualifiedProviderName]: qualifiedPlugin}, {prompt})
      .thenResolve({[CI_PROVIDER]: qualifiedProviderName});
    when(qualifiedScaffolder).calledWith(options).thenResolve(scaffolderResult);

    expect(await scaffoldCiProvider(
      {[qualifiedProviderName]: qualifiedPlugin, [unqualifiedProviderName]: unqualifiedPlugin},
      options,
      {prompt}
    )).toEqual(scaffolderResult);
  });

  it('should treat a plugin without a qualify method as always qualifying', async () => {
    const providerName = any.word();
    const pluginScaffolder = vi.fn();
    const plugin = {scaffold: pluginScaffolder};
    const scaffolderResult = any.simpleObject();
    when(promptForCiProvider)
      .calledWith({[providerName]: plugin}, {prompt})
      .thenResolve({[CI_PROVIDER]: providerName});
    when(pluginScaffolder).calledWith(options).thenResolve(scaffolderResult);

    expect(await scaffoldCiProvider({[providerName]: plugin}, options, {prompt})).toEqual(scaffolderResult);
  });

  it('should not present a prompt when no plugins are registered', async () => {
    expect(await scaffoldCiProvider({}, options, {prompt})).toBe(undefined);
    expect(promptForCiProvider).not.toHaveBeenCalled();
  });

  it('should return undefined when Other is chosen', async () => {
    const providerName = any.word();
    const plugin = {qualify: vi.fn(), scaffold: vi.fn()};
    when(plugin.qualify).calledWith({projectRoot}).thenResolve(true);
    when(promptForCiProvider)
      .calledWith({[providerName]: plugin}, {prompt})
      .thenResolve({[CI_PROVIDER]: 'Other'});

    expect(await scaffoldCiProvider({[providerName]: plugin}, options, {prompt})).toEqual({});
    expect(plugin.scaffold).not.toHaveBeenCalled();
  });
});
