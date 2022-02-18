import {lift as liftReadme} from '@form8ion/readme';

export default async function ({projectRoot, results}) {
  await liftReadme({projectRoot, results});
}
