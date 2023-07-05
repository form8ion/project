import * as prompts from '@form8ion/overridable-prompts';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import * as conditionals from '../../prompts/conditionals';
import {questionNames} from '../../prompts/question-names';
import promptForVcsHostDetails from './prompt';

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
    const hostPrompt = vi.fn();
    const hosts = any.objectWithKeys(
      hostNames,
      {factory: key => ({prompt: host === key ? hostPrompt : () => undefined})}
    );
    const answersWithHostChoice = {...answers, [questionNames.REPO_HOST]: host};
    const hostAnswers = any.simpleObject();
    when(hostPrompt).calledWith({decisions}).mockResolvedValue(hostAnswers);
    when(conditionals.filterChoicesByVisibility).calledWith(hosts, null).mockReturnValue(filteredHostChoices);
    when(prompts.prompt).calledWith([{
      name: questionNames.REPO_HOST,
      type: 'list',
      message: 'Where will the repository be hosted?',
      choices: filteredHostChoices
    }], decisions).mockResolvedValue(answersWithHostChoice);

    expect(await promptForVcsHostDetails(hosts, null, decisions)).toEqual({...answersWithHostChoice, ...hostAnswers});
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
