import {Remote as gitRemote, Repository as gitRepository} from 'nodegit';
import fs from 'mz/fs';
import chalk from 'chalk';
import {promptForVcsHostDetails} from '../prompts/questions';
import {questionNames} from '../prompts/question-names';

function createIgnoreFile(projectRoot, ignore) {
  const {directories, files} = ignore;

  return fs.writeFile(`${projectRoot}/.gitignore`, `${directories.join('\n')}\n\n${files.join('\n')}`);
}

function generateConfigFiles(projectRoot, ignore) {
  console.log(chalk.grey('Generating Git config files'));     // eslint-disable-line no-console

  return Promise.all([
    fs.writeFile(`${projectRoot}/.gitattributes`, '* text=auto'),
    ignore ? createIgnoreFile(projectRoot, ignore) : undefined
  ].filter(Boolean));
}

async function defineRemoteOrigin(projectRoot, origin) {
  if (origin.sshUrl) {
    console.log(chalk.grey(`Setting remote origin to ${origin.sshUrl}`));     // eslint-disable-line no-console

    await gitRemote.create(await gitRepository.open(projectRoot), 'origin', origin.sshUrl);
  }
}

export async function initialize(gitRepoShouldBeInitialized, projectRoot, projectName, vcsHosts, visibility) {
  if (gitRepoShouldBeInitialized) {
    console.log(chalk.blue('Initializing Git Repository'));     // eslint-disable-line no-console

    const [answers] = await Promise.all([
      promptForVcsHostDetails(vcsHosts, visibility),
      gitRepository.init(projectRoot, 0)
    ]);

    return {host: answers[questionNames.REPO_HOST], owner: answers[questionNames.REPO_OWNER], name: projectName};
  }

  return {};
}

export async function scaffold({projectRoot, ignore, origin}) {
  console.log(chalk.blue('Finishing Git Configuration'));     // eslint-disable-line no-console

  return Promise.all([
    generateConfigFiles(projectRoot, ignore),
    defineRemoteOrigin(projectRoot, origin)
  ]);
}
