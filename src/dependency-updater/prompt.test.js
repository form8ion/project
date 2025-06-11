import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import {DEPENDENCY_UPDATER_PROMPT_ID, promptForDependencyUpdaterChoice} from './prompt.js';
import {questionNames} from '../index.js';

vi.mock('@form8ion/overridable-prompts');

describe('dependency updater prompt', () => {
  it('should enable choosing the preferred updater', async () => {
    const prompt = vi.fn();
    const answers = any.simpleObject();
    const updaters = any.simpleObject();
    when(prompt).calledWith({
      id: DEPENDENCY_UPDATER_PROMPT_ID,
      questions: [{
        name: questionNames.DEPENDENCY_UPDATER,
        type: 'list',
        message: 'Which dependency-update service do you want to manage this project?',
        choices: [...Object.keys(updaters), 'Other']
      }]
    }).thenResolve(answers);

    expect(await promptForDependencyUpdaterChoice(updaters, {prompt})).toEqual(answers);
  });
});
