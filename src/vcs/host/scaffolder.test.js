import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import scaffoldVcsHost from './scaffolder.js';

describe('vcs host scaffolder', () => {
  const otherOptions = any.simpleObject();

  it('should scaffold the chosen vcs host', async () => {
    const chosenHost = `${any.word()}CAPITAL${any.word()}`;
    const results = any.simpleObject();
    const chosenHostScaffolder = vi.fn();
    const hostPlugins = {...any.simpleObject(), [chosenHost]: {scaffold: chosenHostScaffolder}};
    when(chosenHostScaffolder).calledWith(otherOptions).mockResolvedValue(results);

    expect(await scaffoldVcsHost(hostPlugins, {...otherOptions, chosenHost: chosenHost.toLowerCase()}))
      .toEqual(results);
  });

  it('should return empty `vcs` results when no matching host is available', async () => {
    const hostPlugins = any.simpleObject();

    expect(await scaffoldVcsHost(hostPlugins, {...otherOptions, chosenHost: any.word()}))
      .toEqual({vcs: {}});
  });
});
