import {prompt} from '@form8ion/overridable-prompts';

import {describe, vi, it, expect} from 'vitest';
import {when} from 'vitest-when';
import any from '@travi/any';

import {questionNames} from '../prompts/question-names.js';
import promptForRepoCreation from './prompt.js';

vi.mock('@form8ion/overridable-prompts');

describe('git prompt', () => {
  it('should ask whether a repository should be created', async () => {
    const decisions = any.simpleObject();
    const repoShouldBeCreated = any.boolean();
    when(prompt)
      .calledWith([{
        name: questionNames.GIT_REPO,
        type: 'confirm',
        default: true,
        message: 'Should a git repository be initialized?'
      }], decisions)
      .thenResolve({[questionNames.GIT_REPO]: repoShouldBeCreated});

    expect(await promptForRepoCreation(decisions)).toBe(repoShouldBeCreated);
  });
});
