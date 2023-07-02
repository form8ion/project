import {prompt, Separator} from '@form8ion/overridable-prompts';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import {questionNames} from '../prompts/question-names';
import promptForLanguageDetails from './prompt';

vi.mock('@form8ion/overridable-prompts');

describe('language prompt', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should prompt for the language details', async () => {
    const answers = any.simpleObject();
    const decisions = any.simpleObject();
    const languages = any.simpleObject();
    when(prompt).calledWith([{
      name: questionNames.PROJECT_LANGUAGE,
      type: 'list',
      message: 'What type of project is this?',
      choices: [...Object.keys(languages), new Separator(), 'Other']
    }], decisions).mockResolvedValue(answers);

    expect(await promptForLanguageDetails(languages, decisions)).toEqual(answers);
  });
});
