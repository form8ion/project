import fs, {promises} from 'fs';
import path from 'path';
import mustache from 'mustache';
import {info} from '@travi/cli-messages';
import badgeInjectorPlugin from '@form8ion/remark-inject-badges';
import remark from '../thirdparty-wrappers/remark';

export default async function ({projectName, projectRoot, description, badges, documentation}) {
  info('Generating README');

  const initialRender = mustache.render(
    await promises.readFile(path.resolve(__dirname, '..', 'templates/README.mustache'), 'utf8'),
    {projectName, description, documentation}
  );

  return new Promise((resolve, reject) => {
    remark()
      .use(badgeInjectorPlugin, badges)
      .process(initialRender, (err, file) => {
        if (err) reject(err);
        else {
          fs.writeFileSync(`${projectRoot}/README.md`, `${file}`);
          resolve();
        }
      });
  });
}
