import {simpleGit} from 'simple-git';
import hostedGitInfo from 'hosted-git-info';
import {info, warn} from '@travi/cli-messages';
import {scaffold as scaffoldGit} from '@form8ion/git';

import {scaffold as scaffoldVcsHost} from '../host/index.js';

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

async function defineRemoteOrigin(projectRoot, sshUrl) {
  const git = simpleGit({baseDir: projectRoot});
  const existingRemotes = await getExistingRemotes(git);

  if (existingRemotes.includes('origin')) {
    warn('The `origin` remote is already defined for this repository');

    return {nextSteps: []};
  }

  if (sshUrl) {
    info(`Setting remote origin to ${sshUrl}`, {level: 'secondary'});

    await git.addRemote('origin', sshUrl);

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

export async function scaffold(
  gitRepoShouldBeInitialized,
  projectRoot,
  projectName,
  description,
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

      return {vcs: {owner: user, name: project, host: type}};
    }

    const [{vcs: {host, owner, name, sshUrl}}] = await Promise.all([
      scaffoldVcsHost(vcsHosts, visibility, decisions, {projectName, projectRoot, description, visibility}),
      scaffoldGit({projectRoot})
    ]);

    const remoteOriginResults = await defineRemoteOrigin(projectRoot, sshUrl);

    return {
      vcs: {host, owner, name},
      nextSteps: [{summary: 'Commit scaffolded files'}, ...remoteOriginResults.nextSteps]
    };
  }

  return {};
}
