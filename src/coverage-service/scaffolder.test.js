import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import scaffoldChoiceFromOptions from '../plugins/choice-scaffolder.js';
import chooseCoverageService from './prompt.js';
import scaffoldCoverageService from './scaffolder.js';

vi.mock('../plugins/choice-scaffolder.js');
vi.mock('./prompt.js');

describe('coverage service scaffolder', () => {
  const prompt = () => undefined;
  const projectRoot = any.string();
  const options = {projectRoot};

  it('should scaffold the chosen provider', async () => {
    const scaffolderResult = any.simpleObject();
    const choicePrompt = () => undefined;
    const plugins = any.simpleObject();
    when(chooseCoverageService)
      .calledWith({prompt})
      .thenReturn(choicePrompt);
    when(scaffoldChoiceFromOptions)
      .calledWith({plugins, options}, {choicePrompt})
      .thenResolve(scaffolderResult);

    expect(await scaffoldCoverageService({plugins, options}, {prompt})).toEqual(scaffolderResult);
  });
});
