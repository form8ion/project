import deepmerge from 'deepmerge';
import {applyEnhancers} from '@form8ion/core';
import {lift as liftReadme} from '@form8ion/readme';

import {test as gitIgnoreExists, lift as liftGitignore} from './vcs/git/ignore/index.js';

export default async function ({projectRoot, results, enhancers, vcs, dependencies}) {
  const enhancerResults = await applyEnhancers({
    results,
    enhancers: {...enhancers, gitIgnore: {test: gitIgnoreExists, lift: liftGitignore}},
    options: {projectRoot, vcs},
    dependencies
  });

  await liftReadme({projectRoot, results: deepmerge.all([results, enhancerResults])});

  return enhancerResults;
}
