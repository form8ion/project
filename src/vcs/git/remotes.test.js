import {simpleGit} from 'simple-git';
import parseGitUrl from 'git-url-parse';

import {describe, vi, it, expect, beforeEach} from 'vitest';
import {when} from 'vitest-when';
import any from '@travi/any';

import {determineExistingVcsDetails, defineRemoteOrigin} from './remotes.js';

vi.mock('simple-git');
vi.mock('git-url-parse');

describe('Git remote', () => {
  const projectRoot = any.string();

  describe('determine', () => {
    const remote = vi.fn();
    const remoteOrigin = any.url();
    const repoName = any.word();
    const vcsHostAccount = any.word();

    beforeEach(() => {
      when(simpleGit).calledWith({baseDir: projectRoot}).thenReturn({remote});
    });

    it('should determine existing vcs details from the remote origin definition of the local repository', async () => {
      const vcsHost = `F${any.word()})O${any.word()}O`;
      when(remote).calledWith(['get-url', 'origin']).thenResolve(`${remoteOrigin}\n`);
      when(parseGitUrl)
        .calledWith(remoteOrigin)
        .thenReturn({owner: vcsHostAccount, name: repoName, host: vcsHost.toLowerCase()});

      const {vcs: hostDetails} = await determineExistingVcsDetails({projectRoot});

      expect(hostDetails).toEqual({host: vcsHost.toLowerCase(), owner: vcsHostAccount, name: repoName});
    });

    it(
      'should return `github` when the host is determined to be `github.com` until that can be a breaking change',
      async () => {
        when(simpleGit).calledWith({baseDir: projectRoot}).thenReturn({remote});
        when(remote).calledWith(['get-url', 'origin']).thenResolve(`${remoteOrigin}\n`);
        when(parseGitUrl)
          .calledWith(remoteOrigin)
          .thenReturn({owner: vcsHostAccount, name: repoName, host: 'github.com'});

        const {vcs: hostDetails} = await determineExistingVcsDetails({projectRoot});

        expect(hostDetails).toEqual({host: 'github', owner: vcsHostAccount, name: repoName});
      }
    );
  });

  describe('define', () => {
    const sshUrl = any.url();

    it('should define the remote origin', async () => {
      const listRemote = vi.fn();
      const addRemote = vi.fn();
      when(simpleGit).calledWith({baseDir: projectRoot}).thenReturn({listRemote, addRemote});
      when(listRemote).calledWith().thenResolve(any.listOf(any.word));

      const {nextSteps} = await defineRemoteOrigin(projectRoot, sshUrl);

      expect(addRemote).toHaveBeenCalledWith('origin', sshUrl);
      expect(nextSteps).toEqual([{summary: 'Set local `master` branch to track upstream `origin/master`'}]);
    });

    it('should define the remote origin when no remotes are defined', async () => {
      const listRemote = vi.fn();
      const addRemote = vi.fn();
      when(simpleGit).calledWith({baseDir: projectRoot}).thenReturn({listRemote, addRemote});
      when(listRemote).calledWith().thenThrow(new Error('fatal: No remote configured to list refs from.\n'));

      const {nextSteps} = await defineRemoteOrigin(projectRoot, sshUrl);

      expect(nextSteps).toEqual([{summary: 'Set local `master` branch to track upstream `origin/master`'}]);
    });

    it('should throw git errors that are not a lack of defined remotes', async () => {
      const error = new Error(any.sentence());
      const listRemote = vi.fn();
      when(simpleGit).calledWith({baseDir: projectRoot}).thenReturn({listRemote});
      when(listRemote).calledWith().thenThrow(error);

      await expect(defineRemoteOrigin(projectRoot, sshUrl)).rejects.toThrow(error);
    });

    it('should return no next-steps when the remote origin is already defined', async () => {
      const listRemote = vi.fn();
      when(simpleGit).calledWith({baseDir: projectRoot}).thenReturn({listRemote});
      when(listRemote).calledWith().thenResolve([...any.listOf(any.word), 'origin', ...any.listOf(any.word)]);

      const {nextSteps} = await defineRemoteOrigin(projectRoot, sshUrl);

      expect(nextSteps).toEqual([]);
    });

    it('should return no next-steps when no `sshUrl` is provided', async () => {
      const {nextSteps} = await defineRemoteOrigin(projectRoot);

      expect(nextSteps).toEqual([]);
    });
  });
});
