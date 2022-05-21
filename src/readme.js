import {promises as fs} from 'fs';
import path from 'path';

import filedirname from 'filedirname';
import mustache from 'mustache';
import {info} from '@travi/cli-messages';
import {lift as liftReadme} from '@form8ion/readme';

const [, __dirname] = filedirname();

export default async function ({projectName, projectRoot, description, badges, documentation}) {
  info('Generating README');

  const initialRender = mustache.render(
    await fs.readFile(path.resolve(__dirname, '..', 'templates/README.mustache'), 'utf8'),
    {projectName, description, documentation}
  );

  await fs.writeFile(`${projectRoot}/README.md`, initialRender);

  return liftReadme({projectRoot, results: {badges}});
}
