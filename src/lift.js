import deepmerge from 'deepmerge';
import {applyEnhancers} from '@form8ion/core';
import {lift as liftReadme} from '@form8ion/readme';
import * as gitPlugin from '@form8ion/git';

export default async function ({projectRoot, results, enhancers, vcs, dependencies}) {
  const enhancerResults = await applyEnhancers({
    results,
    enhancers: {...enhancers, gitPlugin},
    options: {projectRoot, vcs},
    dependencies
  });

  await liftReadme({projectRoot, results: deepmerge.all([results, enhancerResults])});

  return enhancerResults;
}
