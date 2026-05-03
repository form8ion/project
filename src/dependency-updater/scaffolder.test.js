import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import {promptForDependencyUpdaterChoice} from './prompt.js';
import scaffoldUpdater from './scaffolder.js';
import {questionNames} from '../prompts/index.js';

vi.mock('./prompt.js');

const {DEPENDENCY_UPDATER} = questionNames.DEPENDENCY_UPDATER;

describe('dependency-updater scaffolder', () => {
  const prompt = () => undefined;

  it('should execute the chosen scaffolder with the appropriate options', async () => {
    const options = any.simpleObject();
    const chosenUpdater = any.word();
    const chosenUpdaterScaffolder = vi.fn();
    const plugins = {...any.simpleObject(), [chosenUpdater]: {scaffold: chosenUpdaterScaffolder}};
    const scaffolderResult = any.simpleObject();
    when(promptForDependencyUpdaterChoice)
      .calledWith(plugins, {prompt})
      .thenResolve({[DEPENDENCY_UPDATER]: chosenUpdater});
    when(chosenUpdaterScaffolder).calledWith(options).thenResolve(scaffolderResult);

    expect(await scaffoldUpdater(plugins, options, {prompt})).toEqual(scaffolderResult);
  });

  it('should not present a prompt if no updaters are registered', async () => {
    expect(await scaffoldUpdater({}, any.simpleObject(), any.simpleObject())).toBe(undefined);
    expect(promptForDependencyUpdaterChoice).not.toHaveBeenCalled(promptForDependencyUpdaterChoice);
  });

  it('should not result in an error when choosing an updater without a defined scaffolder', async () => {
    const plugins = any.simpleObject();
    const options = any.simpleObject();
    const context = {prompt: undefined};
    when(promptForDependencyUpdaterChoice)
      .calledWith(plugins, context)
      .thenResolve({[DEPENDENCY_UPDATER]: any.word()});

    expect(await scaffoldUpdater(plugins, options, context)).toBe(undefined);
  });
});
