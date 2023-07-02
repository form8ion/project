import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import scaffold from './scaffolder';

describe('language scaffolder', () => {
  it('should scaffold the chosen language', async () => {
    const options = any.simpleObject();
    const chosenLanguage = any.word();
    const scaffolderResult = any.simpleObject();
    const chosenLanguageScaffolder = vi.fn();
    const scaffolders = {...any.simpleObject(), [chosenLanguage]: chosenLanguageScaffolder};
    when(chosenLanguageScaffolder).calledWith(options).mockResolvedValue(scaffolderResult);

    expect(await scaffold(scaffolders, chosenLanguage, options)).toEqual(scaffolderResult);
  });

  it('should not result in an error when choosing a language without a defined scaffolder', async () => {
    await scaffold(any.simpleObject(), any.word(), any.simpleObject());
  });
});
