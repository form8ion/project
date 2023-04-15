import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import * as prompt from './prompt';
import scaffoldUpdater from './scaffolder';
import {questionNames} from '..';
import {promptForDependencyUpdaterChoice} from './prompt';

vi.mock('./prompt');

describe('dependency-updater scaffolder', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should execute the chosen scaffolder with the appropriate options', async () => {
    const decisions = any.simpleObject();
    const options = any.simpleObject();
    const chosenUpdater = any.word();
    const chosenUpdaterScaffolder = vi.fn();
    const scaffolders = {...any.simpleObject(), [chosenUpdater]: {scaffolder: chosenUpdaterScaffolder}};
    const scaffolderResult = any.simpleObject();
    when(prompt.promptForDependencyUpdaterChoice)
      .calledWith(scaffolders, decisions)
      .mockResolvedValue({[questionNames.DEPENDENCY_UPDATER]: chosenUpdater});
    when(chosenUpdaterScaffolder).calledWith(options).mockResolvedValue(scaffolderResult);

    expect(await scaffoldUpdater(scaffolders, decisions, options)).toEqual(scaffolderResult);
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
