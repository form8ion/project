import {promises as fs} from 'node:fs';

export default function ({projectRoot}) {
  return fs.writeFile(`${projectRoot}/.gitignore`, '');
}
