import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import {questionNames} from '../../prompts/question-names.js';
import terminalPromptFactory from '../../prompts/terminal-prompt.js';
import promptForVcsHostDetails from './prompt.js';
import scaffoldVcsHost from './scaffolder.js';

vi.mock('../../prompts/terminal-prompt.js');
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
    const terminalPrompt = () => undefined;
    when(terminalPromptFactory).calledWith(decisions).thenReturn(terminalPrompt);
    when(promptForVcsHostDetails)
      .calledWith(hostPlugins, visibility, decisions)
      .thenResolve({[questionNames.REPO_HOST]: chosenHost, [questionNames.REPO_OWNER]: owner});
    when(chosenHostScaffolder).calledWith(options, {prompt: terminalPrompt}).thenResolve(results);

    expect(await scaffoldVcsHost(hostPlugins, visibility, decisions, options)).toEqual(results);
  });

  it('should return empty `vcs` results when no matching host is available', async () => {
    const hostPlugins = any.simpleObject();
    when(promptForVcsHostDetails)
      .calledWith(hostPlugins, visibility, decisions)
      .thenResolve({[questionNames.REPO_HOST]: any.word()});

    expect(await scaffoldVcsHost(hostPlugins, visibility, decisions, options)).toEqual({vcs: {}});
  });
});
