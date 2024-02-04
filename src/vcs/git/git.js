import {promises as fs} from 'node:fs';

import {simpleGit} from 'simple-git';
import hostedGitInfo from 'hosted-git-info';
import {info, warn} from '@travi/cli-messages';

import promptForVcsHostDetails from '../host/prompt.js';
import {questionNames} from '../../prompts/question-names.js';
import {scaffold as scaffoldIgnoreFile, lift as liftIgnoreFile} from './ignore/index.js';

function generateConfigFiles(projectRoot, ignore) {
  info('Generating Git config files', {level: 'secondary'});

  return Promise.all([
    fs.writeFile(`${projectRoot}/.gitattributes`, '* text=auto'),
    ignore ? liftIgnoreFile({projectRoot, results: {vcsIgnore: ignore}}) : undefined
  ].filter(Boolean));
}

async function getExistingRemotes(git) {
  try {
    return await git.listRemote();
  } catch (e) {
    if ('fatal: No remote configured to list refs from.\n' === e.message) {
      return [];
    }

    throw e;
  }
}

async function defineRemoteOrigin(projectRoot, origin) {
  const git = simpleGit({baseDir: projectRoot});
  const existingRemotes = await getExistingRemotes(git);

  if (existingRemotes.includes('origin')) {
    warn('The `origin` remote is already defined for this repository');

    return {nextSteps: []};
  }

  if (origin.sshUrl) {
    info(`Setting remote origin to ${origin.sshUrl}`, {level: 'secondary'});

    await git.addRemote('origin', origin.sshUrl);

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
    const git = simpleGit({baseDir: projectRoot});
    if (await git.checkIsRepo('root')) {
      info('Git repository already exists');

      const remoteOrigin = await git.remote(['get-url', 'origin']);
      const {user, project, type} = hostedGitInfo.fromUrl(remoteOrigin);

      return {owner: user, name: project, host: type};
    }

    info('Initializing Git Repository');

    const [answers] = await Promise.all([
      promptForVcsHostDetails(vcsHosts, visibility, decisions),
      git.init(),
      scaffoldIgnoreFile({projectRoot})
    ]);

    return {
      host: answers[questionNames.REPO_HOST].toLowerCase(),
      owner: answers[questionNames.REPO_OWNER],
      name: projectName
    };
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
