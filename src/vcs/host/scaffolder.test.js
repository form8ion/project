import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import scaffoldVcsHost from './scaffolder.js';
import promptForVcsHostDetails from './prompt.js';
import {questionNames} from '../../prompts/question-names.js';
import terminalPrompt from '../../prompts/terminal-prompt.js';

vi.mock('./prompt');

describe('vcs host scaffolder', () => {
  const options = any.simpleObject();
  const visibility = any.word();
  const decisions = any.simpleObject();

  it('should scaffold the chosen vcs host', async () => {
    const chosenHost = `${any.word()}CAPITAL${any.word()}`;
    const results = any.simpleObject();
    const chosenHostScaffolder = vi.fn();
    const hostPlugins = {...any.simpleObject(), [chosenHost.toLowerCase()]: {scaffold: chosenHostScaffolder}};
    const owner = any.word;
    when(promptForVcsHostDetails)
      .calledWith(hostPlugins, visibility, decisions)
      .mockResolvedValue({[questionNames.REPO_HOST]: chosenHost, [questionNames.REPO_OWNER]: owner});
    when(chosenHostScaffolder).calledWith({...options, owner}, {prompt: terminalPrompt}).mockResolvedValue(results);

    expect(await scaffoldVcsHost(hostPlugins, visibility, decisions, options))
      .toEqual(results);
  });

  it('should return empty `vcs` results when no matching host is available', async () => {
    const hostPlugins = any.simpleObject();
    when(promptForVcsHostDetails)
      .calledWith(hostPlugins, visibility, decisions)
      .mockResolvedValue({[questionNames.REPO_HOST]: any.word()});

    expect(await scaffoldVcsHost(hostPlugins, visibility, decisions, options)).toEqual({vcs: {}});
  });
});
