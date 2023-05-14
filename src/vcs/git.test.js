import {promises as fs} from 'node:fs';
import hostedGitInfo from 'hosted-git-info';
import * as simpleGit from 'simple-git';

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import * as prompts from '../prompts/questions';
import {questionNames} from '../prompts/question-names';
import {initialize, scaffold} from './git';

vi.mock('node:fs');
vi.mock('hosted-git-info');
vi.mock('simple-git');
vi.mock('../prompts/questions');

describe('git', () => {
  let checkIsRepo, init, remote, listRemote, addRemote;
  const projectRoot = any.string();
  const visibility = any.word();
  const decisions = any.simpleObject();

  beforeEach(() => {
    checkIsRepo = vi.fn();
    init = vi.fn();
    remote = vi.fn();
    listRemote = vi.fn();
    addRemote = vi.fn();

    when(simpleGit.simpleGit)
      .calledWith(projectRoot)
      .mockReturnValue({checkIsRepo, init, remote, listRemote, addRemote});
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
      when(prompts.promptForVcsHostDetails)
        .calledWith(vcsHosts, visibility, decisions)
        .mockResolvedValue({[questionNames.REPO_HOST]: repoHost, [questionNames.REPO_OWNER]: repoOwner});

      const hostDetails = await initialize(true, projectRoot, projectName, vcsHosts, visibility, decisions);

      expect(init).toHaveBeenCalledOnce();
      expect(hostDetails).toEqual({host: repoHost.toLowerCase(), owner: repoOwner, name: projectName});
    });

    it('should not initialize the git repo if the project will not be versioned', async () => {
      when(checkIsRepo).calledWith('root').mockResolvedValue(false);
      when(prompts.promptForVcsHostDetails)
        .calledWith(githubAccount, visibility, decisions)
        .mockResolvedValue({[questionNames.REPO_HOST]: repoHost, [questionNames.REPO_OWNER]: repoOwner});

      const hostDetails = await initialize(false, projectRoot, projectName, githubAccount, visibility, decisions);

      expect(init).not.toHaveBeenCalledOnce();
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

      expect(init).not.toHaveBeenCalledOnce();
      expect(hostDetails).toEqual({host: repoHost.toLowerCase(), owner: repoOwner, name: repoName});
    });
  });

  describe('scaffold', () => {
    it('should scaffold the git repo', async () => {
      // listRemote.mockRejectedValue(new simpleGit.GitError(null, 'fatal: No remote configured to list refs from.'));
      listRemote.mockRejectedValue(new Error('fatal: No remote configured to list refs from.'));

      const results = await scaffold({projectRoot, origin: {}});

      expect(fs.writeFile).toHaveBeenCalledWith(`${projectRoot}/.gitattributes`, '* text=auto');
      expect(fs.writeFile).not.toHaveBeenCalledWith(`${projectRoot}/.gitignore`);
      expect(init).not.toHaveBeenCalled();

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

      expect(fs.writeFile).toHaveBeenCalledWith(
        `${projectRoot}/.gitignore`,
        `${directories.join('\n')}\n\n${files.join('\n')}`
      );
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
