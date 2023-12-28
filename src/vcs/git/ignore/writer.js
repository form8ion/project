import {promises as fs} from 'node:fs';

export default function ({projectRoot, files = [], directories = []}) {
  return fs.writeFile(`${projectRoot}/.gitignore`, `${directories.join('\n')}\n\n${files.join('\n')}`);
}
