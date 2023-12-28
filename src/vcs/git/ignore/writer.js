import {promises as fs} from 'node:fs';

export default function ({projectRoot, files = [], directories = []}) {
  return fs.appendFile(`${projectRoot}/.gitignore`, `\n${directories.join('\n')}\n\n${files.join('\n')}`);
}
