import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import promptForProjectLanguage from './prompt.js';
import {questionNames} from '../prompts/question-names.js';
import scaffold from './scaffolder.js';

vi.mock('./prompt.js');

const {PROJECT_LANGUAGE} = questionNames.PROJECT_LANGUAGE;

describe('language scaffolder', () => {
  const dependencies = any.simpleObject();

  it('should scaffold the chosen language', async () => {
    const options = any.simpleObject();
    const chosenLanguage = any.word();
    const scaffolderResult = any.simpleObject();
    const chosenLanguageScaffolder = vi.fn();
    const plugins = {...any.simpleObject(), [chosenLanguage]: {scaffold: chosenLanguageScaffolder}};
    when(promptForProjectLanguage)
      .calledWith(plugins, dependencies)
      .thenResolve({[PROJECT_LANGUAGE]: chosenLanguage});
    when(chosenLanguageScaffolder).calledWith(options, dependencies).thenResolve(scaffolderResult);

    expect(await scaffold(plugins, options, dependencies)).toEqual(scaffolderResult);
  });

  it('should not result in an error when choosing a language without a defined scaffolder', async () => {
    const plugins = any.simpleObject();
    const options = any.simpleObject();
    when(promptForProjectLanguage).calledWith(plugins, dependencies).thenResolve({[PROJECT_LANGUAGE]: any.word()});

    await scaffold(plugins, options, dependencies);
  });
});
