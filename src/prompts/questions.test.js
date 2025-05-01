import * as core from '@form8ion/core';
import * as prompts from '@form8ion/overridable-prompts';

import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import {promptForBaseDetails} from './questions.js';

vi.mock('@form8ion/core');
vi.mock('@form8ion/overridable-prompts');

describe('base details prompt', () => {
  const projectPath = any.string();
  const answers = any.simpleObject();
  const decisions = any.simpleObject();
  const questions = any.listOf(any.simpleObject);

  it('should prompt for the necessary details', async () => {
    when(core.questionsForBaseDetails).calledWith(decisions, projectPath).thenReturn(questions);
    when(prompts.prompt).calledWith(questions, decisions).thenResolve(answers);

    expect(await promptForBaseDetails(projectPath, decisions)).toEqual(answers);
  });
});
