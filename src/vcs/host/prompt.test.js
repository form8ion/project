import {beforeEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import {questionNames} from '../../prompts/question-names.js';
import promptForVcsHostDetails, {REPOSITORY_HOST_PROMPT_ID} from './prompt.js';

vi.mock('@form8ion/overridable-prompts');
vi.mock('../../prompts/conditionals');

describe('vcs host details prompt', () => {
  let prompt;
  const answers = any.simpleObject();

  beforeEach(() => {
    prompt = vi.fn();
  });

  it('should prompt for the vcs hosting details', async () => {
    const host = any.string();
    const hostNames = [...any.listOf(any.string), host];
    const hosts = any.objectWithKeys(hostNames, {factory: () => ({})});
    const answersWithHostChoice = {...answers, [questionNames.REPO_HOST]: host};
    when(prompt).calledWith({
      id: REPOSITORY_HOST_PROMPT_ID,
      questions: [{
        name: questionNames.REPO_HOST,
        type: 'list',
        message: 'Where will the repository be hosted?',
        choices: hostNames
      }]
    }).thenResolve(answersWithHostChoice);

    expect(await promptForVcsHostDetails(hosts, {prompt})).toEqual(answersWithHostChoice);
  });

  it('should not throw an error when `Other` is chosen as the host', async () => {
    const answersWithHostChoice = {...answers, [questionNames.REPO_HOST]: 'Other'};
    when(prompt).calledWith({
      id: REPOSITORY_HOST_PROMPT_ID,
      questions: [{
        name: questionNames.REPO_HOST,
        type: 'list',
        message: 'Where will the repository be hosted?',
        choices: []
      }]
    }).thenResolve(answersWithHostChoice);

    expect(await promptForVcsHostDetails({}, {prompt})).toEqual(answersWithHostChoice);
  });
});
