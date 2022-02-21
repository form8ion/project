import deepmerge from 'deepmerge';
import {applyEnhancers} from '@form8ion/core';
import {lift as liftReadme} from '@form8ion/readme';

export default async function ({projectRoot, results, enhancers, vcs}) {
  const enhancerResults = await applyEnhancers({results, enhancers, options: {projectRoot, vcs}});

  await liftReadme({projectRoot, results: deepmerge.all([results, enhancerResults])});

  return enhancerResults;
}
