import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import * as languagePrompt from './prompt.js';
import {questionNames} from '../prompts/question-names.js';
import scaffold from './scaffolder.js';

vi.mock('./prompt.js');

describe('language scaffolder', () => {
  it('should scaffold the chosen language', async () => {
    const options = any.simpleObject();
    const chosenLanguage = any.word();
    const scaffolderResult = any.simpleObject();
    const prompt = () => undefined;
    const chosenLanguageScaffolder = vi.fn();
    const plugins = {...any.simpleObject(), [chosenLanguage]: {scaffold: chosenLanguageScaffolder}};
    when(languagePrompt.default)
      .calledWith(plugins, {prompt})
      .thenResolve({[questionNames.PROJECT_LANGUAGE]: chosenLanguage});
    when(chosenLanguageScaffolder).calledWith(options).thenResolve(scaffolderResult);

    expect(await scaffold(plugins, options, {prompt})).toEqual(scaffolderResult);
  });

  it('should not result in an error when choosing a language without a defined scaffolder', async () => {
    languagePrompt.default.mockResolvedValue({[questionNames.PROJECT_LANGUAGE]: any.word()});

    await scaffold(any.simpleObject(), any.simpleObject(), any.simpleObject());
  });
});
