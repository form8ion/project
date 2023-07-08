import * as core from '@form8ion/core';
import * as prompts from '@form8ion/overridable-prompts';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import {questionNames} from './question-names';
import {promptForBaseDetails} from './questions';

vi.mock('@form8ion/core');
vi.mock('@form8ion/overridable-prompts');

describe('base details prompt', () => {
  const projectPath = any.string();
  const answers = any.simpleObject();
  const decisions = any.simpleObject();
  const questions = any.listOf(any.simpleObject);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should prompt for the necessary details', async () => {
    const copyrightHolder = any.string();
    when(core.questionsForBaseDetails).calledWith(decisions, projectPath, copyrightHolder).mockReturnValue(questions);
    when(prompts.prompt).calledWith([
      ...questions,
      {
        name: questionNames.GIT_REPO,
        type: 'confirm',
        default: true,
        message: 'Should a git repository be initialized?'
      }
    ], decisions).mockResolvedValue(answers);

    expect(await promptForBaseDetails(projectPath, copyrightHolder, decisions)).toEqual(answers);
  });
});