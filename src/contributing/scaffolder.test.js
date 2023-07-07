import {describe, expect, it} from 'vitest';
import any from '@travi/any';

import scaffoldContributing from './scaffolder';

describe('contributing scaffolder', () => {
  it('should return the PRs-welcome badge for public projects', () => {
    const {badges} = scaffoldContributing({visibility: 'Public'});

    expect(badges.contribution).toEqual({
      PRs: {
        text: 'PRs Welcome',
        link: 'https://makeapullrequest.com',
        img: 'https://img.shields.io/badge/PRs-welcome-brightgreen.svg'
      }
    });
  });

  it('should not return badges for non-public projects', () => {
    expect(scaffoldContributing({visibility: any.word()})).toEqual({});
  });
});
