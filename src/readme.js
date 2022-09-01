import {lift as liftReadme, scaffold as scaffoldReadme} from '@form8ion/readme';

export default async function ({projectName, projectRoot, description, badges, documentation}) {
  await scaffoldReadme({projectRoot, projectName, description});

  return liftReadme({projectRoot, results: {badges, documentation}});
}
