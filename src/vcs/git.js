import {Repository as gitRepository} from 'nodegit';
import fs from 'mz/fs';
import chalk from 'chalk';

function createIgnoreFile(projectRoot, ignore) {
  const {directories, files} = ignore;

  return fs.writeFile(`${projectRoot}/.gitignore`, `${directories.join('\n')}\n\n${files.join('\n')}`);
}

export function initialize(projectRoot) {
  console.log(chalk.blue('Initializing Git Repository'));     // eslint-disable-line no-console

  return gitRepository.init(projectRoot, 0);
}

export function scaffold({projectRoot, ignore}) {
  console.log(chalk.blue('Generating Git Configuration'));     // eslint-disable-line no-console

  return Promise.all([
    fs.writeFile(`${projectRoot}/.gitattributes`, '* text=auto'),
    ignore ? createIgnoreFile(projectRoot, ignore) : undefined
  ].filter(Boolean));
}
