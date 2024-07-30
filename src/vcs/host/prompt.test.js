import * as prompts from '@form8ion/overridable-prompts';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import * as conditionals from '../../prompts/conditionals.js';
import {questionNames} from '../../prompts/question-names.js';
import promptForVcsHostDetails from './prompt.js';

vi.mock('@form8ion/overridable-prompts');
vi.mock('../../prompts/conditionals');

describe('vcs host details prompt', () => {
  const filteredHostChoices = any.listOf(any.word);
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
    when(conditionals.filterChoicesByVisibility).calledWith(hosts, null).mockReturnValue(filteredHostChoices);
    when(prompts.prompt).calledWith([{
      name: questionNames.REPO_HOST,
      type: 'list',
      message: 'Where will the repository be hosted?',
      choices: filteredHostChoices
    }], decisions).mockResolvedValue(answersWithHostChoice);

    expect(await promptForVcsHostDetails(hosts, null, decisions)).toEqual(answersWithHostChoice);
  });

  it('should not throw an error when `Other` is chosen as the host', async () => {
    const hosts = {};
    const visibility = any.word();
    const answersWithHostChoice = {...answers, [questionNames.REPO_HOST]: 'Other'};
    when(conditionals.filterChoicesByVisibility).calledWith(hosts, visibility).mockReturnValue(filteredHostChoices);
    when(prompts.prompt).calledWith([{
      name: questionNames.REPO_HOST,
      type: 'list',
      message: 'Where will the repository be hosted?',
      choices: filteredHostChoices
    }], decisions).mockResolvedValue(answersWithHostChoice);

    expect(await promptForVcsHostDetails(hosts, visibility, decisions)).toEqual(answersWithHostChoice);
  });
});
