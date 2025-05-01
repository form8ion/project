import {simpleGit} from 'simple-git';
import hostedGitInfo from 'hosted-git-info';

import {describe, vi, it, expect} from 'vitest';
import {when} from 'vitest-when';
import any from '@travi/any';

import {determineExistingVcsDetails, defineRemoteOrigin} from './remotes.js';

vi.mock('simple-git');
vi.mock('hosted-git-info');

describe('Git remote', () => {
  const projectRoot = any.string();

  describe('determine', () => {
    it('should determine existing vcs details from the remote origin definition of the local repository', async () => {
      const remote = vi.fn();
      const remoteOrigin = any.url();
      const repoName = any.word();
      const vcsHost = `F${any.word()})O${any.word()}O`;
      const vcsHostAccount = any.word();
      when(simpleGit).calledWith({baseDir: projectRoot}).thenReturn({remote});
      when(remote).calledWith(['get-url', 'origin']).thenResolve(remoteOrigin);
      when(hostedGitInfo.fromUrl)
        .calledWith(remoteOrigin)
        .thenReturn({user: vcsHostAccount, project: repoName, type: vcsHost.toLowerCase()});

      const {vcs: hostDetails} = await determineExistingVcsDetails({projectRoot});

      expect(hostDetails).toEqual({host: vcsHost.toLowerCase(), owner: vcsHostAccount, name: repoName});
    });
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
