import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import * as languagePrompt from './prompt.js';
import {questionNames} from '../prompts/question-names.js';
import scaffold from './scaffolder.js';

vi.mock('./prompt.js');

describe('language scaffolder', () => {
  it('should scaffold the chosen language', async () => {
    const options = any.simpleObject();
    const chosenLanguage = any.word();
    const scaffolderResult = any.simpleObject();
    const decisions = any.simpleObject();
    const chosenLanguageScaffolder = vi.fn();
    const plugins = {...any.simpleObject(), [chosenLanguage]: {scaffold: chosenLanguageScaffolder}};
    when(languagePrompt.default)
      .calledWith(plugins, decisions)
      .mockResolvedValue({[questionNames.PROJECT_LANGUAGE]: chosenLanguage});
    when(chosenLanguageScaffolder).calledWith(options).mockResolvedValue(scaffolderResult);

    expect(await scaffold(plugins, decisions, options)).toEqual(scaffolderResult);
  });

  it('should not result in an error when choosing a language without a defined scaffolder', async () => {
    when(languagePrompt.default).mockResolvedValue({[questionNames.PROJECT_LANGUAGE]: any.word()});

    await scaffold(any.simpleObject(), any.simpleObject(), any.simpleObject());
  });
});
