import {Remote as gitRemote, Repository as gitRepository} from 'nodegit';
import {promises} from 'fs';
import {directoryExists} from '@form8ion/core';
import {info, warn} from '@travi/cli-messages';
import {fromUrl} from '../../thirdparty-wrappers/hosted-git-info';
import {promptForVcsHostDetails} from '../prompts/questions';
import {questionNames} from '../prompts/question-names';

function createIgnoreFile(projectRoot, ignore) {
  const {directories, files} = ignore;

  return promises.writeFile(`${projectRoot}/.gitignore`, `${directories.join('\n')}\n\n${files.join('\n')}`);
}

function generateConfigFiles(projectRoot, ignore) {
  info('Generating Git config files', {level: 'secondary'});

  return Promise.all([
    promises.writeFile(`${projectRoot}/.gitattributes`, '* text=auto'),
    ignore ? createIgnoreFile(projectRoot, ignore) : undefined
  ].filter(Boolean));
}

async function defineRemoteOrigin(projectRoot, origin) {
  const repository = await gitRepository.open(projectRoot);
  const existingRemotes = await gitRemote.list(repository);

  if (existingRemotes.includes('origin')) {
    warn('The `origin` remote is already defined for this repository');

    return {nextSteps: []};
  }

  if (origin.sshUrl) {
    info(`Setting remote origin to ${origin.sshUrl}`, {level: 'secondary'});

    await gitRemote.create(repository, 'origin', origin.sshUrl);

    // info('Setting the local `master` branch to track `origin/master`');
    //
    // await gitBranch.setUpstream(
    //   await gitBranch.lookup(repository, 'master', gitBranch.BRANCH.LOCAL),
    //   'origin/master'
    // );

    return {nextSteps: [{summary: 'Set local `master` branch to track upstream `origin/master`'}]};
  }

  warn('URL not available to configure remote `origin`');

  return {nextSteps: []};
}

export async function initialize(
  gitRepoShouldBeInitialized,
  projectRoot,
  projectName,
  vcsHosts,
  visibility,
  decisions
) {
  if (gitRepoShouldBeInitialized) {
    if (await directoryExists(`${projectRoot}/.git`)) {
      info('Git repository already exists');

      const repository = await gitRepository.open(projectRoot);
      const remoteOrigin = await gitRemote.lookup(repository, 'origin');
      const {owner, name, type} = fromUrl(remoteOrigin.url());

      return {owner, name, host: type};
    }

    info('Initializing Git Repository');

    const [answers] = await Promise.all([
      promptForVcsHostDetails(vcsHosts, visibility, decisions),
      gitRepository.init(projectRoot, 0)
    ]);

    return {host: answers[questionNames.REPO_HOST], owner: answers[questionNames.REPO_OWNER], name: projectName};
  }

  return undefined;
}

export async function scaffold({projectRoot, ignore, origin}) {
  info('Finishing Git Configuration');

  const [remoteOriginResults] = await Promise.all([
    defineRemoteOrigin(projectRoot, origin),
    generateConfigFiles(projectRoot, ignore)
  ]);

  return {nextSteps: [{summary: 'Commit scaffolded files'}, ...remoteOriginResults.nextSteps]};
}
