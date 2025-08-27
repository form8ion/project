import {test as alreadyVersionedByGit, scaffold as scaffoldGit} from '@form8ion/git';

import {describe, expect, it, vi} from 'vitest';
import {when} from 'vitest-when';
import any from '@travi/any';

import {scaffold as scaffoldVcsHost} from './host/index.js';
import {determineExistingVcsDetails, defineRemoteOrigin} from './git/index.js';
import promptForRepoCreation from './prompt.js';
import scaffoldVcs from './scaffolder.js';

vi.mock('@form8ion/git');
vi.mock('./git/index.js');
vi.mock('./host/index.js');
vi.mock('./prompt.js');

describe('vcs scaffolder', () => {
  const projectRoot = any.string();
  const prompt = () => undefined;

  it('should scaffold the repository and vcs host details', async () => {
    const host = any.word();
    const owner = any.word();
    const name = any.word();
    const vcsHosts = any.simpleObject();
    const visibility = any.word();
    const projectName = any.word();
    const description = any.sentence();
    const vcsHostDetails = {host, owner, name};
    const sshUrl = any.url();
    const remoteOriginNextSteps = any.listOf(any.simpleObject);
    when(promptForRepoCreation).calledWith({prompt}).thenResolve(true);
    when(alreadyVersionedByGit).calledWith({projectRoot}).thenResolve(false);
    when(scaffoldVcsHost)
      .calledWith(vcsHosts, {projectName, projectRoot, description, visibility}, {prompt})
      .thenResolve({vcs: {...vcsHostDetails, sshUrl, ...any.simpleObject()}});
    when(defineRemoteOrigin).calledWith(projectRoot, sshUrl).thenResolve({nextSteps: remoteOriginNextSteps});

    expect(await scaffoldVcs({projectRoot, projectName, vcsHosts, visibility, description}, {prompt})).toEqual({
      vcs: vcsHostDetails,
      nextSteps: [{summary: 'Commit scaffolded files'}, ...remoteOriginNextSteps]
    });
    expect(scaffoldGit).toHaveBeenCalledWith({projectRoot});
  });

  it('should not scaffold a repository or vcs host details when the project is already versioned by git', async () => {
    const existingVcsDetails = any.simpleObject();
    when(promptForRepoCreation).calledWith({prompt}).thenResolve(true);
    when(alreadyVersionedByGit).calledWith({projectRoot}).thenResolve(true);
    when(determineExistingVcsDetails).calledWith({projectRoot}).thenResolve(existingVcsDetails);

    expect(await scaffoldVcs({projectRoot}, {prompt})).toEqual(existingVcsDetails);
  });

  it('should not scaffold a repository or vcs host details when a repository should not be created', async () => {
    when(promptForRepoCreation).calledWith({prompt}).thenResolve(false);

    expect(await scaffoldVcs({projectRoot}, {prompt})).toEqual({});
  });
});
