import {scaffold as scaffoldGit, test as alreadyVersionedByGit} from '@form8ion/git';

import repositoryShouldBeCreated from './prompt.js';
import {determineExistingVcsDetails, defineRemoteOrigin} from './git/index.js';
import {scaffold as scaffoldVcsHost} from './host/index.js';

export default async function scaffoldVcs(
  {projectRoot, projectName, vcsHosts, visibility, description},
  {prompt, logger}
) {
  if (await repositoryShouldBeCreated({prompt})) {
    if (await alreadyVersionedByGit({projectRoot})) {
      logger.info('Git repository already exists');

      return determineExistingVcsDetails({projectRoot});
    }

    const [{vcs: {host, owner, name, sshUrl}}] = await Promise.all([
      scaffoldVcsHost(vcsHosts, {projectName, projectRoot, description, visibility}, {prompt}),
      scaffoldGit({projectRoot})
    ]);

    const remoteOriginResults = await defineRemoteOrigin(projectRoot, sshUrl, {logger});

    return {
      vcs: {host, owner, name},
      nextSteps: [{summary: 'Commit scaffolded files'}, ...remoteOriginResults.nextSteps]
    };
  }

  return {};
}
