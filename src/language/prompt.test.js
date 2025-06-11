import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import {questionNames} from '../prompts/question-names.js';
import promptForLanguageDetails, {PROJECT_LANGUAGE_PROMPT_ID} from './prompt.js';

vi.mock('@form8ion/overridable-prompts');

describe('language prompt', () => {
  it('should prompt for the language details', async () => {
    const prompt = vi.fn();
    const answers = any.simpleObject();
    const languages = any.simpleObject();
    when(prompt).calledWith({
      id: PROJECT_LANGUAGE_PROMPT_ID,
      questions: [{
        name: questionNames.PROJECT_LANGUAGE,
        type: 'list',
        message: 'What type of project is this?',
        choices: [...Object.keys(languages), 'Other']
      }]
    }).thenResolve(answers);

    expect(await promptForLanguageDetails(languages, {prompt})).toEqual(answers);
  });
});
