import * as prompts from '@form8ion/overridable-prompts';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import {questionNames} from '../../prompts/question-names.js';
import promptForVcsHostDetails from './prompt.js';

vi.mock('@form8ion/overridable-prompts');
vi.mock('../../prompts/conditionals');

describe('vcs host details prompt', () => {
  const answers = any.simpleObject();
  const decisions = any.simpleObject();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should prompt for the vcs hosting details', async () => {
    const host = any.string();
    const hostNames = [...any.listOf(any.string), host];
    const hosts = any.objectWithKeys(hostNames, {factory: () => ({})});
    const answersWithHostChoice = {...answers, [questionNames.REPO_HOST]: host};
    when(prompts.prompt).calledWith([{
      name: questionNames.REPO_HOST,
      type: 'list',
      message: 'Where will the repository be hosted?',
      choices: hostNames
    }], decisions).thenResolve(answersWithHostChoice);

    expect(await promptForVcsHostDetails(hosts, null, decisions)).toEqual(answersWithHostChoice);
  });

  it('should not throw an error when `Other` is chosen as the host', async () => {
    const visibility = any.word();
    const answersWithHostChoice = {...answers, [questionNames.REPO_HOST]: 'Other'};
    when(prompts.prompt).calledWith([{
      name: questionNames.REPO_HOST,
      type: 'list',
      message: 'Where will the repository be hosted?',
      choices: []
    }], decisions).thenResolve(answersWithHostChoice);

    expect(await promptForVcsHostDetails({}, visibility, decisions)).toEqual(answersWithHostChoice);
  });
});
