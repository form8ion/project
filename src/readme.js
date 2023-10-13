import {lift as liftReadme} from '@form8ion/readme';

import {scaffold as scaffoldReadme} from './readme/index.js';

export default async function ({projectName, projectRoot, description, badges, documentation}) {
  await scaffoldReadme({projectRoot, projectName, description});

  return liftReadme({projectRoot, results: {badges, documentation}});
}
