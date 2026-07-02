import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import chooseDependencyUpdater, {DEPENDENCY_UPDATER_PROMPT_ID} from './prompt.js';
import {questionNames} from '../prompts/index.js';

vi.mock('@form8ion/overridable-prompts');

const {DEPENDENCY_UPDATER} = questionNames.DEPENDENCY_UPDATER;

describe('dependency updater prompt', () => {
  it('should enable choosing the preferred updater', async () => {
    const prompt = vi.fn();
    const chosenUpdater = any.word();
    const answers = {...any.simpleObject(), [DEPENDENCY_UPDATER]: chosenUpdater};
    const updaters = any.simpleObject();
    when(prompt).calledWith({
      id: DEPENDENCY_UPDATER_PROMPT_ID,
      questions: [{
        name: DEPENDENCY_UPDATER,
        type: 'list',
        message: 'Which dependency-update service do you want to manage this project?',
        choices: [...Object.keys(updaters), 'Other']
      }]
    }).thenResolve(answers);

    expect(await chooseDependencyUpdater({prompt})(updaters)).toEqual(chosenUpdater);
  });
});
