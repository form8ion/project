import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import {questionNames} from '../../prompts/question-names.js';
import promptForVcsHostDetails from './prompt.js';
import scaffoldVcsHost from './scaffolder.js';

vi.mock('./prompt');

describe('vcs host scaffolder', () => {
  const options = any.simpleObject();
  const prompt = () => undefined;

  it('should scaffold the chosen vcs host', async () => {
    const chosenHost = `${any.word()}CAPITAL${any.word()}`;
    const results = any.simpleObject();
    const chosenHostScaffolder = vi.fn();
    const hostPlugins = {...any.simpleObject(), [chosenHost.toLowerCase()]: {scaffold: chosenHostScaffolder}};
    const owner = any.word;
    when(promptForVcsHostDetails)
      .calledWith(hostPlugins, {prompt})
      .thenResolve({[questionNames.REPO_HOST]: chosenHost, [questionNames.REPO_OWNER]: owner});
    when(chosenHostScaffolder).calledWith(options).thenResolve(results);

    expect(await scaffoldVcsHost(hostPlugins, options, {prompt})).toEqual(results);
  });

  it('should return empty `vcs` results when no matching host is available', async () => {
    const hostPlugins = any.simpleObject();
    when(promptForVcsHostDetails)
      .calledWith(hostPlugins, {prompt})
      .thenResolve({[questionNames.REPO_HOST]: any.word()});

    expect(await scaffoldVcsHost(hostPlugins, options, {prompt})).toEqual({vcs: {}});
  });
});
