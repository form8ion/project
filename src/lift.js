import {applyEnhancers} from '@form8ion/core';
import {lift as liftReadme} from '@form8ion/readme';
import * as gitPlugin from '@form8ion/git';

import * as licensePlugin from './license/index.js';

export default async function ({projectRoot, results, enhancers, vcs, dependencies}) {
  const enhancerResults = await applyEnhancers({
    results,
    enhancers: {...enhancers, gitPlugin, licensePlugin},
    options: {projectRoot, vcs},
    dependencies
  });

  await liftReadme({projectRoot, results: enhancerResults});

  return enhancerResults;
}
