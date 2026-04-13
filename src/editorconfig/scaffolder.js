import {promises as fs} from 'node:fs';

import determinePathToTemplateFile from '../template-path.js';

export default function scaffoldEditorConfig({projectRoot}) {
  return fs.copyFile(determinePathToTemplateFile('editorconfig.ini'), `${projectRoot}/.editorconfig`);
}
