import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import scaffoldChoiceFromOptions from '../plugins/choice-scaffolder.js';
import chooseDependencyUpdater from './prompt.js';
import scaffoldUpdater from './scaffolder.js';

vi.mock('../plugins/choice-scaffolder.js');
vi.mock('./prompt.js');

describe('dependency-updater scaffolder', () => {
  it('should execute the chosen scaffolder with the appropriate options', async () => {
    const prompt = () => undefined;
    const choicePrompt = () => undefined;
    const options = any.simpleObject();
    const plugins = any.simpleObject();
    const scaffolderResult = any.simpleObject();
    when(chooseDependencyUpdater)
      .calledWith({prompt})
      .thenReturn(choicePrompt);
    when(scaffoldChoiceFromOptions).calledWith({plugins, options}, {choicePrompt}).thenResolve(scaffolderResult);

    expect(await scaffoldUpdater({plugins, options}, {prompt})).toEqual(scaffolderResult);
  });
});
