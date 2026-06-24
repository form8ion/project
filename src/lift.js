import {applyEnhancers} from '@form8ion/core';
import {lift as liftReadme} from '@form8ion/readme';
import * as gitPlugin from '@form8ion/git';
import * as misePlugin from '@form8ion/mise';

import {scaffold as scaffoldEditorconfig, test as editorconfigInUse} from './editorconfig/index.js';
import * as licensePlugin from './license/index.js';

export default async function lift({projectRoot, results, enhancers, vcs}, dependencies) {
  if (!await editorconfigInUse({projectRoot})) {
    await scaffoldEditorconfig({projectRoot});
  }

  const enhancerResults = await applyEnhancers({
    results,
    enhancers: {...enhancers, gitPlugin, licensePlugin, misePlugin},
    options: {projectRoot, vcs},
    dependencies
  });

  await liftReadme({projectRoot, results: enhancerResults}, dependencies);

  return enhancerResults;
}
