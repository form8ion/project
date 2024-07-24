import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import scaffold from './scaffolder.js';

describe('language scaffolder', () => {
  it('should scaffold the chosen language', async () => {
    const options = any.simpleObject();
    const chosenLanguage = any.word();
    const scaffolderResult = any.simpleObject();
    const chosenLanguageScaffolder = vi.fn();
    const plugins = {...any.simpleObject(), [chosenLanguage]: {scaffold: chosenLanguageScaffolder}};
    when(chosenLanguageScaffolder).calledWith(options).mockResolvedValue(scaffolderResult);

    expect(await scaffold(plugins, chosenLanguage, options)).toEqual(scaffolderResult);
  });

  it('should not result in an error when choosing a language without a defined scaffolder', async () => {
    await scaffold(any.simpleObject(), any.word(), any.simpleObject());
  });
});
