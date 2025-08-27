import {simpleGit} from 'simple-git';
import parseGitUrl from 'git-url-parse';
import {warn} from '@travi/cli-messages';

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

export async function determineExistingVcsDetails({projectRoot}) {
  const git = simpleGit({baseDir: projectRoot});
  const remoteOrigin = await git.remote(['get-url', 'origin']);
  const {owner, name, host} = parseGitUrl(remoteOrigin.trimEnd());

  return {vcs: {owner, name, host: 'github.com' === host ? 'github' : host}};
}

export async function defineRemoteOrigin(projectRoot, sshUrl) {
  if (!sshUrl) {
    warn('URL not available to configure remote `origin`');

    return {nextSteps: []};
  }

  const git = simpleGit({baseDir: projectRoot});
  const existingRemotes = await getExistingRemotes(git);

  if (existingRemotes.includes('origin')) {
    warn('The `origin` remote is already defined for this repository');

    return {nextSteps: []};
  }

  // info('Setting the local `master` branch to track `origin/master`');
  //
  // await gitBranch.setUpstream(
  //   await gitBranch.lookup(repository, 'master', gitBranch.BRANCH.LOCAL),
  //   'origin/master'
  // );

  await git.addRemote('origin', sshUrl);

  return {nextSteps: [{summary: 'Set local `master` branch to track upstream `origin/master`'}]};
}
