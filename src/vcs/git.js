import {Repository as gitRepository} from 'nodegit';
import fs from 'mz/fs';
import chalk from 'chalk';
import {promptForVcsHostDetails} from '../prompts/questions';
import {questionNames} from '../prompts/question-names';

function createIgnoreFile(projectRoot, ignore) {
  const {directories, files} = ignore;

  return fs.writeFile(`${projectRoot}/.gitignore`, `${directories.join('\n')}\n\n${files.join('\n')}`);
}

export async function initialize(gitRepoShouldBeInitialized, projectRoot, projectName, vcsHosts) {
  if (gitRepoShouldBeInitialized) {
    console.log(chalk.blue('Initializing Git Repository'));     // eslint-disable-line no-console

    const [answers] = await Promise.all([
      promptForVcsHostDetails(vcsHosts),
      gitRepository.init(projectRoot, 0)
    ]);

    return {host: answers[questionNames.REPO_HOST], owner: answers[questionNames.REPO_OWNER], name: projectName};
  }

  return {};
}

export function scaffold({projectRoot, ignore}) {
  console.log(chalk.blue('Generating Git Configuration'));     // eslint-disable-line no-console

  return Promise.all([
    fs.writeFile(`${projectRoot}/.gitattributes`, '* text=auto'),
    ignore ? createIgnoreFile(projectRoot, ignore) : undefined
  ].filter(Boolean));
}
