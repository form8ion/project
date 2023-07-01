import {promises as fs} from 'node:fs';

import determinePathToTemplateFile from '../template-path';

export default function ({projectRoot}) {
  return fs.copyFile(determinePathToTemplateFile('editorconfig.txt'), `${projectRoot}/.editorconfig`);
}
