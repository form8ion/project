import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import scaffoldChoiceFromOptions from '../plugins/choice-scaffolder.js';
import chooseCiProvider from './prompt.js';
import scaffoldCiProvider from './scaffolder.js';

vi.mock('../plugins/choice-scaffolder.js');
vi.mock('./prompt.js');

describe('ci-provider scaffolder', () => {
  const prompt = () => undefined;
  const projectRoot = any.string();
  const options = {projectRoot};

  it('should scaffold the chosen provider', async () => {
    const scaffolderResult = any.simpleObject();
    const choicePrompt = () => undefined;
    const plugins = any.simpleObject();
    when(chooseCiProvider)
      .calledWith({prompt})
      .thenReturn(choicePrompt);
    when(scaffoldChoiceFromOptions)
      .calledWith({plugins, options}, {choicePrompt})
      .thenResolve(scaffolderResult);

    expect(await scaffoldCiProvider({plugins, options}, {prompt})).toEqual(scaffolderResult);
  });
});
