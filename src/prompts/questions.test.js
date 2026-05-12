import * as core from '@form8ion/core';

import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import {promptForBaseDetails, BASE_DETAILS_PROMPT_ID} from './questions.js';

vi.mock('@form8ion/core');
vi.mock('@form8ion/overridable-prompts');

describe('base details prompt', () => {
  const projectPath = any.string();
  const answers = any.simpleObject();
  const questions = any.listOf(any.simpleObject);
  const prompt = vi.fn();

  it('should prompt for the necessary details', async () => {
    when(core.questionsForBaseDetails).calledWith(projectPath).thenReturn(questions);
    when(prompt).calledWith({id: BASE_DETAILS_PROMPT_ID, questions}).thenResolve(answers);

    expect(await promptForBaseDetails(projectPath, {prompt})).toEqual(answers);
  });
});
