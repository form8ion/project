import {info} from '@travi/cli-messages';
import {scaffold as scaffoldGit, test as alreadyVersionedByGit} from '@form8ion/git';

import repositoryShouldBeCreated from './prompt.js';
import {determineExistingVcsDetails, defineRemoteOrigin} from './git/index.js';
import {scaffold as scaffoldVcsHost} from './host/index.js';

export default async function scaffoldVcs({projectRoot, projectName, decisions, vcsHosts, visibility, description}) {
  if (await repositoryShouldBeCreated(decisions)) {
    if (await alreadyVersionedByGit({projectRoot})) {
      info('Git repository already exists');

      return {vcs: await determineExistingVcsDetails({projectRoot})};
    }

    const [{vcs: {host, owner, name, sshUrl}}] = await Promise.all([
      scaffoldVcsHost(
        vcsHosts,
        decisions,
        {projectName, projectRoot, description, visibility}
      ),
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
