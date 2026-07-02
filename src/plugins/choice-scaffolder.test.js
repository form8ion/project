import {describe, it, expect, vi} from 'vitest';
import {when} from 'vitest-when';
import any from '@travi/any';

import filterToQualifiedPlugins from './qualification-filter.js';
import scaffoldChoiceFromOptions from './choice-scaffolder.js';

vi.mock('./qualification-filter.js');

describe('plugin choice scaffolder', () => {
  const projectRoot = any.string();
  const options = {projectRoot};
  const plugins = any.simpleObject();
  const chosenPlugin = any.word();

  it('should return undefined when no plugins are provided', async () => {
    expect(await scaffoldChoiceFromOptions({plugins: {}}, {})).toBeUndefined();
  });

  it('should return empty results when no plugin is provided for the chosen option', async () => {
    const choicePrompt = vi.fn();
    const qualifiedPlugins = any.simpleObject();
    when(filterToQualifiedPlugins).calledWith({plugins, projectRoot}).thenResolve(qualifiedPlugins);
    when(choicePrompt).calledWith(qualifiedPlugins).thenResolve(chosenPlugin);

    expect(await scaffoldChoiceFromOptions(
      {plugins, options},
      {choicePrompt}
    )).toEqual({});
  });

  it('should scaffold the chosen plugin', async () => {
    const choicePrompt = vi.fn();
    const chosenPluginScaffolder = vi.fn();
    const qualifiedPlugins = {...any.simpleObject(), [chosenPlugin]: {scaffold: chosenPluginScaffolder}};
    const scaffoldResults = any.simpleObject();
    when(filterToQualifiedPlugins).calledWith({plugins, projectRoot}).thenResolve(qualifiedPlugins);
    when(choicePrompt).calledWith(qualifiedPlugins).thenResolve(chosenPlugin);
    when(chosenPluginScaffolder).calledWith(options).thenResolve(scaffoldResults);

    expect(await scaffoldChoiceFromOptions(
      {plugins, options},
      {choicePrompt}
    )).toEqual(scaffoldResults);
  });
});
