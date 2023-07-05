import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import scaffoldVcsHost from './scaffolder';

describe('vcs host scaffolder', () => {
  it('should scaffold the chosen vcs host', async () => {
    const chosenHost = `${any.word()}CAPITAL${any.word()}`;
    const otherOptions = any.simpleObject();
    const results = any.simpleObject();
    const chosenHostScaffolder = vi.fn();
    const hostScaffolders = {...any.simpleObject(), [chosenHost]: {scaffolder: chosenHostScaffolder}};
    when(chosenHostScaffolder).calledWith(otherOptions).mockResolvedValue(results);

    expect(await scaffoldVcsHost(hostScaffolders, {...otherOptions, host: chosenHost.toLowerCase()})).toEqual(results);
  });
});
