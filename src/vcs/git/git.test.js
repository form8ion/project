import hostedGitInfo from 'hosted-git-info';
import * as simpleGit from 'simple-git';
import {scaffold as scaffoldGit} from '@form8ion/git';

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import {scaffold as scaffoldVcsHost} from '../host/index.js';
import {scaffold} from './git.js';

vi.mock('node:fs');
vi.mock('hosted-git-info');
vi.mock('simple-git');
vi.mock('@form8ion/git');
vi.mock('../host/index.js');
vi.mock('./ignore/index.js');

describe('git', () => {
  let checkIsRepo, remote, listRemote, addRemote;
  const projectRoot = any.string();
  const visibility = any.word();
  const decisions = any.simpleObject();
  const vcsHost = `F${any.word()})O${any.word()}O`;
  const vcsHostAccount = any.word();
  const repositoryName = any.word();
  const githubAccount = any.word();
  const projectName = any.word();
  const description = any.sentence();
  const sshUrl = any.url();
  const vcsDetails = {name: repositoryName, owner: vcsHostAccount, host: vcsHost, sshUrl};
  const vcsHostResults = {...any.simpleObject(), vcs: vcsDetails};

  beforeEach(() => {
    checkIsRepo = vi.fn();
    remote = vi.fn();
    listRemote = vi.fn();
    addRemote = vi.fn();

    when(simpleGit.simpleGit)
      .calledWith({baseDir: projectRoot})
      .thenReturn({checkIsRepo, remote, listRemote, addRemote});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize the git repo', async () => {
    const vcsHosts = any.simpleObject();
    when(checkIsRepo).calledWith('root').thenResolve(false);
    when(scaffoldVcsHost)
      .calledWith(vcsHosts, visibility, decisions, {projectName, projectRoot, description, visibility})
      .thenResolve(vcsHostResults);
    listRemote.mockResolvedValue(any.listOf(any.word));

    expect(await scaffold(
      true,
      projectRoot,
      projectName,
      description,
      vcsHosts,
      visibility,
      decisions
    )).toEqual({
      vcs: {owner: vcsHostAccount, name: repositoryName, host: vcsHost},
      nextSteps: [
        {summary: 'Commit scaffolded files'},
        {summary: 'Set local `master` branch to track upstream `origin/master`'}
      ]
    });
    expect(scaffoldGit).toHaveBeenCalledWith({projectRoot});
    expect(addRemote).toHaveBeenCalledWith('origin', sshUrl);
  });

  it('should not initialize the git repo if the project will not be versioned', async () => {
    when(checkIsRepo).calledWith('root').thenResolve(false);

    const hostDetails = await scaffold(false, projectRoot, projectName, githubAccount, visibility, decisions);

    expect(scaffoldGit).not.toHaveBeenCalled();
    expect(hostDetails).toEqual({});
  });

  it('should return the git details from an existing remote', async () => {
    const repoName = any.word();
    const remoteOrigin = any.url();
    when(checkIsRepo).calledWith('root').thenResolve(true);
    when(remote).calledWith(['get-url', 'origin']).thenResolve(remoteOrigin);
    when(hostedGitInfo.fromUrl)
      .calledWith(remoteOrigin)
      .thenReturn({user: vcsHostAccount, project: repoName, type: vcsHost.toLowerCase()});

    const hostDetails = await scaffold(true, projectRoot, projectName, githubAccount, visibility);

    expect(scaffoldGit).not.toHaveBeenCalled();
    expect(hostDetails).toEqual({vcs: {host: vcsHost.toLowerCase(), owner: vcsHostAccount, name: repoName}});
  });

  it('should throw git errors that are not a lack of defined remotes', async () => {
    const error = new Error(any.sentence());
    when(checkIsRepo).calledWith('root').thenResolve(false);
    scaffoldVcsHost.mockResolvedValue(vcsHostResults);
    listRemote.mockRejectedValue(error);

    await expect(scaffold(true, projectRoot)).rejects.toThrow(error);
  });

  it('should not define the remote origin if it already exists', async () => {
    when(checkIsRepo).calledWith('root').thenResolve(false);
    scaffoldVcsHost.mockResolvedValue(vcsHostResults);
    listRemote.mockResolvedValue(['origin']);

    const result = await scaffold(true, projectRoot);

    expect(addRemote).not.toHaveBeenCalled();
    expect(result.nextSteps).toEqual([{summary: 'Commit scaffolded files'}]);
  });
});
