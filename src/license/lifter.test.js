import any from '@travi/any';
import {describe, expect, it} from 'vitest';

import lift from './lifter.js';

describe('license lifter', () => {
  it('should provide the badge if the repository is hosted on GitHub', async () => {
    const vcsOwner = any.word();
    const vcsName = any.word();
    const {badges} = await lift({vcs: {host: 'github', owner: vcsOwner, name: vcsName}});

    expect(badges.consumer.license).toEqual({
      link: 'LICENSE',
      img: `https://img.shields.io/github/license/${vcsOwner}/${vcsName}.svg`,
      text: 'license'
    });
  });

  it('should not provide the badge if the repository is not hosted on GitHub', async () => {
    const {badges} = await lift({vcs: {host: any.word()}});

    expect(badges).toBe(undefined);
  });

  it('should not provide the badge if the project is not under version control', async () => {
    const {badges} = await lift({});

    expect(badges).toBe(undefined);
  });
});
