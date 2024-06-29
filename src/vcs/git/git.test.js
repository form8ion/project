import hostedGitInfo from 'hosted-git-info';
import * as simpleGit from 'simple-git';
import {lift as liftGit, scaffold as scaffoldGit} from '@form8ion/git';

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import promptForVcsHostDetails from '../host/prompt.js';
import {questionNames} from '../../prompts/question-names.js';
import {lift as liftIgnoreFile} from './ignore/index.js';
import {initialize, scaffold} from './git.js';

vi.mock('node:fs');
vi.mock('hosted-git-info');
vi.mock('simple-git');
vi.mock('@form8ion/git');
vi.mock('../host/prompt');
vi.mock('./ignore/index.js');

describe('git', () => {
  let checkIsRepo, remote, listRemote, addRemote;
  const projectRoot = any.string();
  const visibility = any.word();
  const decisions = any.simpleObject();

  beforeEach(() => {
    checkIsRepo = vi.fn();
    remote = vi.fn();
    listRemote = vi.fn();
    addRemote = vi.fn();

    when(simpleGit.simpleGit)
      .calledWith({baseDir: projectRoot})
      .mockReturnValue({checkIsRepo, remote, listRemote, addRemote});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    const repoHost = `F${any.word()})O${any.word()}O`;
    const repoOwner = any.word();
    const githubAccount = any.word();
    const projectName = any.word();

    it('should initialize the git repo', async () => {
      const vcsHosts = any.simpleObject();
      when(checkIsRepo).calledWith('root').mockResolvedValue(false);
      when(promptForVcsHostDetails)
        .calledWith(vcsHosts, visibility, decisions)
        .mockResolvedValue({[questionNames.REPO_HOST]: repoHost, [questionNames.REPO_OWNER]: repoOwner});

      const hostDetails = await initialize(true, projectRoot, projectName, vcsHosts, visibility, decisions);

      expect(scaffoldGit).toHaveBeenCalledWith({projectRoot});
      expect(hostDetails).toEqual({host: repoHost.toLowerCase(), owner: repoOwner, name: projectName});
    });

    it('should not initialize the git repo if the project will not be versioned', async () => {
      when(checkIsRepo).calledWith('root').mockResolvedValue(false);
      when(promptForVcsHostDetails)
        .calledWith(githubAccount, visibility, decisions)
        .mockResolvedValue({[questionNames.REPO_HOST]: repoHost, [questionNames.REPO_OWNER]: repoOwner});

      const hostDetails = await initialize(false, projectRoot, projectName, githubAccount, visibility, decisions);

      expect(scaffoldGit).not.toHaveBeenCalled();
      expect(hostDetails).toBe(undefined);
    });

    it('should return the git details from an existing account', async () => {
      const repoName = any.word();
      const remoteOrigin = any.url();
      when(checkIsRepo).calledWith('root').mockResolvedValue(true);
      when(remote).calledWith(['get-url', 'origin']).mockResolvedValue(remoteOrigin);
      when(hostedGitInfo.fromUrl)
        .calledWith(remoteOrigin)
        .mockReturnValue({user: repoOwner, project: repoName, type: repoHost.toLowerCase()});

      const hostDetails = await initialize(true, projectRoot, projectName, githubAccount, visibility);

      expect(scaffoldGit).not.toHaveBeenCalled();
      expect(hostDetails).toEqual({host: repoHost.toLowerCase(), owner: repoOwner, name: repoName});
    });
  });

  describe('scaffold', () => {
    it('should scaffold the git repo', async () => {
      listRemote.mockRejectedValue(new Error('fatal: No remote configured to list refs from.\n'));

      const results = await scaffold({projectRoot, origin: {}});

      expect(liftGit).toHaveBeenCalledWith({projectRoot});
      expect(scaffoldGit).not.toHaveBeenCalled();

      expect(results.nextSteps).toEqual([{summary: 'Commit scaffolded files'}]);
    });

    it('throws git errors that are not a lack of defined remotes', async () => {
      const error = new Error(any.sentence());
      listRemote.mockRejectedValue(error);

      await expect(scaffold({projectRoot, origin: {}})).rejects.toThrow(error);
    });

    it('should create the ignore file when patterns are defined', async () => {
      const directories = any.listOf(any.string);
      const files = any.listOf(any.string);
      listRemote.mockResolvedValue(any.listOf(any.word));

      await scaffold({projectRoot, ignore: {directories, files}, origin: {}});

      expect(liftIgnoreFile).toHaveBeenCalledWith({projectRoot, results: {vcsIgnore: {directories, files}}});
    });

    it('should define the remote origin when an ssl-url is provided for the remote', async () => {
      const sshUrl = any.url();
      // const branch = any.simpleObject();
      // gitBranch.lookup.withArgs(repository, 'master', gitBranch.BRANCH.LOCAL).resolves(branch);
      listRemote.mockResolvedValue(any.listOf(any.word));

      const results = await scaffold({projectRoot, origin: {sshUrl}});

      expect(addRemote).toHaveBeenCalledWith('origin', sshUrl);
      expect(results.nextSteps).toEqual([
        {summary: 'Commit scaffolded files'},
        {summary: 'Set local `master` branch to track upstream `origin/master`'}
      ]);
      // assert.calledWith(gitBranch.setUpstream, branch, 'origin/master');
    });

    it('should not define the remote origin if it already exists', async () => {
      const sshUrl = any.url();
      listRemote.mockResolvedValue(['origin']);

      await scaffold({projectRoot, origin: {sshUrl}});

      expect(addRemote).not.toHaveBeenCalled();
      // assert.notCalled(gitBranch.lookup);
      // assert.notCalled(gitBranch.setUpstream);
    });
  });
});
