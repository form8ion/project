import * as prompts from '@form8ion/overridable-prompts';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import {promptForDependencyUpdaterChoice} from './prompt';
import {questionNames} from '../index';

vi.mock('@form8ion/overridable-prompts');

describe('dependency updater prompt', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should enable choosing the preferred updater', async () => {
    const answers = any.simpleObject();
    const updaters = any.simpleObject();
    const decisions = any.simpleObject();
    when(prompts.prompt).calledWith([{
      name: questionNames.DEPENDENCY_UPDATER,
      type: 'list',
      message: 'Which dependency-update service do you want to manage this project?',
      choices: [...Object.keys(updaters), new prompts.Separator(), 'Other']
    }], decisions).mockResolvedValue(answers);

    expect(await promptForDependencyUpdaterChoice(updaters, decisions)).toEqual(answers);
  });
});
