import {describe, vi, it, expect} from 'vitest';
import {when} from 'vitest-when';
import any from '@travi/any';

import {questionNames} from '../prompts/question-names.js';
import promptForRepoCreation, {GIT_REPOSITORY_PROMPT_ID} from './prompt.js';

vi.mock('@form8ion/overridable-prompts');

describe('git prompt', () => {
  it('should ask whether a repository should be created', async () => {
    const prompt = vi.fn();
    const repoShouldBeCreated = any.boolean();
    when(prompt)
      .calledWith({
        id: GIT_REPOSITORY_PROMPT_ID,
        questions: [{
          name: questionNames.GIT_REPO,
          type: 'confirm',
          default: true,
          message: 'Should a git repository be initialized?'
        }]
      })
      .thenResolve({[questionNames.GIT_REPO]: repoShouldBeCreated});

    expect(await promptForRepoCreation({prompt})).toBe(repoShouldBeCreated);
  });
});
