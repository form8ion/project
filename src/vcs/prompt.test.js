import {describe, vi, it, expect} from 'vitest';
import {when} from 'vitest-when';
import any from '@travi/any';

import {questionNames} from '../prompts/question-names.js';
import promptForRepoCreation, {GIT_REPOSITORY_PROMPT_ID} from './prompt.js';

vi.mock('@form8ion/overridable-prompts');

const {GIT_REPO} = questionNames.GIT_REPOSITORY;

describe('git prompt', () => {
  it('should ask whether a repository should be created', async () => {
    const prompt = vi.fn();
    const repoShouldBeCreated = any.boolean();
    when(prompt)
      .calledWith({
        id: GIT_REPOSITORY_PROMPT_ID,
        questions: [{
          name: GIT_REPO,
          type: 'confirm',
          default: true,
          message: 'Should a git repository be initialized?'
        }]
      })
      .thenResolve({[GIT_REPO]: repoShouldBeCreated});

    expect(await promptForRepoCreation({prompt})).toBe(repoShouldBeCreated);
  });
});
