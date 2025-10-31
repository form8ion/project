import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import {promptForDependencyUpdaterChoice} from './prompt.js';
import scaffoldUpdater from './scaffolder.js';
import {questionNames} from '../index.js';

vi.mock('./prompt.js');

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
      .thenResolve({[questionNames.DEPENDENCY_UPDATER]: chosenUpdater});
    when(chosenUpdaterScaffolder).calledWith(options).thenResolve(scaffolderResult);

    expect(await scaffoldUpdater(plugins, options, {prompt})).toEqual(scaffolderResult);
  });

  it('should not present a prompt if no updaters are registered', async () => {
    expect(await scaffoldUpdater({}, any.simpleObject(), any.simpleObject())).toBe(undefined);
    expect(promptForDependencyUpdaterChoice).not.toHaveBeenCalled(promptForDependencyUpdaterChoice);
  });

  it('should not result in an error when choosing an updater without a defined scaffolder', async () => {
    promptForDependencyUpdaterChoice.mockResolvedValue({[questionNames.DEPENDENCY_UPDATER]: any.word()});

    expect(await scaffoldUpdater(any.simpleObject(), any.simpleObject(), any.simpleObject())).toBe(undefined);
  });
});
