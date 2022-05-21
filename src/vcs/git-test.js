import {Branch as gitBranch, Remote as gitRemote, Repository as gitRepository} from '@form8ion/nodegit-wrapper';
import * as core from '@form8ion/core';
import {promises} from 'fs';
import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import * as hostedGitInfo from '../../thirdparty-wrappers/hosted-git-info';
import * as prompts from '../prompts/questions';
import {questionNames} from '../prompts/question-names';
import {initialize, scaffold} from './git';

suite('scaffold git', () => {
  let sandbox;
  const projectRoot = any.string();
  const visibility = any.word();
  const repository = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(core, 'directoryExists');
    sandbox.stub(promises, 'writeFile');
    sandbox.stub(gitRepository, 'init');
    sandbox.stub(gitRepository, 'open');
    sandbox.stub(gitRemote, 'create');
    sandbox.stub(gitRemote, 'list');
    sandbox.stub(gitRemote, 'lookup');
    sandbox.stub(gitBranch, 'lookup');
    sandbox.stub(gitBranch, 'setUpstream');
    sandbox.stub(prompts, 'promptForVcsHostDetails');
    sandbox.stub(hostedGitInfo, 'fromUrl');

    gitRepository.init.resolves();
  });

  teardown(() => sandbox.restore());

  suite('initialization', () => {
    const repoHost = `F${any.word()})O${any.word()}O`;
    const repoOwner = any.word();
    const githubAccount = any.word();
    const projectName = any.word();

    test('that the git repo is initialized', async () => {
      const vcsHosts = any.simpleObject();
      prompts.promptForVcsHostDetails
        .withArgs(vcsHosts, visibility)
        .resolves({[questionNames.REPO_HOST]: repoHost, [questionNames.REPO_OWNER]: repoOwner});

      const hostDetails = await initialize(true, projectRoot, projectName, vcsHosts, visibility);

      assert.calledWith(gitRepository.init, projectRoot, 0);
      assert.deepEqual(hostDetails, {host: repoHost.toLowerCase(), owner: repoOwner, name: projectName});
    });

    test('that the git repo is not initialized if the project will not be versioned', async () => {
      const decisions = any.simpleObject();
      core.directoryExists.resolves(false);
      prompts.promptForVcsHostDetails
        .withArgs(githubAccount, visibility, decisions)
        .resolves({[questionNames.REPO_HOST]: repoHost, [questionNames.REPO_OWNER]: repoOwner});

      const hostDetails = await initialize(false, projectRoot, projectName, githubAccount, visibility, decisions);

      assert.notCalled(gitRepository.init);
      assert.isUndefined(hostDetails);
    });

    test('that the git details are returned from an existing repository', async () => {
      core.directoryExists.withArgs(`${projectRoot}/.git`).resolves(true);
      const repoName = any.word();
      const remoteOrigin = any.url();
      gitRepository.open.withArgs(projectRoot).resolves(repository);
      gitRemote.lookup.withArgs(repository, 'origin').resolves({url: () => remoteOrigin});
      hostedGitInfo.fromUrl
        .withArgs(remoteOrigin)
        .returns({user: repoOwner, project: repoName, type: repoHost.toLowerCase()});

      const hostDetails = await initialize(true, projectRoot, projectName, githubAccount, visibility);

      assert.notCalled(gitRepository.init);
      assert.deepEqual(hostDetails, {host: repoHost.toLowerCase(), owner: repoOwner, name: repoName});
    });
  });

  suite('scaffold', () => {
    setup(() => {
      gitRepository.open.withArgs(projectRoot).resolves(repository);
      gitRemote.list.withArgs(repository).resolves(any.listOf(any.word));
    });

    test('that the git repo is initialized', async () => {
      promises.writeFile.resolves();

      const results = await scaffold({projectRoot, origin: {}});

      assert.calledWith(promises.writeFile, `${projectRoot}/.gitattributes`, '* text=auto');
      assert.neverCalledWith(promises.writeFile, `${projectRoot}/.gitignore`);
      assert.notCalled(gitRemote.create);

      assert.deepEqual(results.nextSteps, [{summary: 'Commit scaffolded files'}]);
    });

    test('that ignore file is created when patterns are defined', () => {
      const directories = any.listOf(any.string);
      const files = any.listOf(any.string);
      promises.writeFile.resolves();

      return scaffold({projectRoot, ignore: {directories, files}, origin: {}}).then(() => assert.calledWith(
        promises.writeFile,
        `${projectRoot}/.gitignore`,
        `${directories.join('\n')}\n\n${files.join('\n')}`
      ));
    });

    test('that the remote origin is defined when an ssl-url is provided for the remote', async () => {
      const sshUrl = any.url();
      const branch = any.simpleObject();
      gitBranch.lookup.withArgs(repository, 'master', gitBranch.BRANCH.LOCAL).resolves(branch);
      gitRemote.create.resolves();
      gitBranch.setUpstream.resolves();

      const results = await scaffold({projectRoot, origin: {sshUrl}});

      assert.calledWith(gitRemote.create, repository, 'origin', sshUrl);
      assert.deepEqual(
        results.nextSteps,
        [{summary: 'Commit scaffolded files'}, {summary: 'Set local `master` branch to track upstream `origin/master`'}]
      );
      // assert.calledWith(gitBranch.setUpstream, branch, 'origin/master');
    });

    test('that the remote origin is not defined if it already exists', async () => {
      const sshUrl = any.url();
      gitRemote.list.withArgs(repository).resolves(['origin']);

      await scaffold({projectRoot, origin: {sshUrl}});

      assert.notCalled(gitRemote.create);
      assert.notCalled(gitBranch.lookup);
      assert.notCalled(gitBranch.setUpstream);
    });
  });
});
