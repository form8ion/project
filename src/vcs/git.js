import {Remote as gitRemote, Repository as gitRepository, Branch as gitBranch, GIT_BRANCH_LOCAL} from 'nodegit';
import fs from 'mz/fs';
import {info, warn} from '@travi/cli-messages';
import {promptForVcsHostDetails} from '../prompts/questions';
import {questionNames} from '../prompts/question-names';

function createIgnoreFile(projectRoot, ignore) {
  const {directories, files} = ignore;

  return fs.writeFile(`${projectRoot}/.gitignore`, `${directories.join('\n')}\n\n${files.join('\n')}`);
}

function generateConfigFiles(projectRoot, ignore) {
  info('Generating Git config files', {level: 'secondary'});

  return Promise.all([
    fs.writeFile(`${projectRoot}/.gitattributes`, '* text=auto'),
    ignore ? createIgnoreFile(projectRoot, ignore) : undefined
  ].filter(Boolean));
}

async function defineRemoteOrigin(projectRoot, origin) {
  const repository = await gitRepository.open(projectRoot);
  const existingRemotes = await gitRemote.list(repository);

  if (existingRemotes.includes('origin')) warn('The `origin` remote is already defined for this repository');
  else if (origin.sshUrl) {
    info(`Setting remote origin to ${origin.sshUrl}`, {level: 'secondary'});

    await gitRemote.create(repository, 'origin', origin.sshUrl);

    info('Setting the local `master` branch to track `origin/master`');

    await gitBranch.setUpstream(await gitBranch.lookup(repository, 'master', GIT_BRANCH_LOCAL), 'origin/master');
  } else warn('URL not available to configure remote `origin`');
}

export async function initialize(gitRepoShouldBeInitialized, projectRoot, projectName, vcsHosts, visibility) {
  if (gitRepoShouldBeInitialized) {
    info('Initializing Git Repository');

    const [answers] = await Promise.all([
      promptForVcsHostDetails(vcsHosts, visibility),
      gitRepository.init(projectRoot, 0)
    ]);

    return {host: answers[questionNames.REPO_HOST], owner: answers[questionNames.REPO_OWNER], name: projectName};
  }

  return undefined;
}

export async function scaffold({projectRoot, ignore, origin}) {
  info('Finishing Git Configuration');

  return Promise.all([
    generateConfigFiles(projectRoot, ignore),
    defineRemoteOrigin(projectRoot, origin)
  ]);
}
