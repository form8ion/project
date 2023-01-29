import {promises as fs} from 'fs';
import hostedGitInfo from 'hosted-git-info';
import * as simpleGit from 'simple-git';

import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';

import * as prompts from '../prompts/questions';
import {questionNames} from '../prompts/question-names';
import {initialize, scaffold} from './git';

suite('scaffold git', () => {
  let sandbox, checkIsRepo, init, remote, listRemote, addRemote;
  const projectRoot = any.string();
  const visibility = any.word();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
    sandbox.stub(simpleGit, 'simpleGit');
    sandbox.stub(prompts, 'promptForVcsHostDetails');
    sandbox.stub(hostedGitInfo, 'fromUrl');

    checkIsRepo = sinon.stub();
    init = sinon.stub();
    remote = sinon.stub();
    listRemote = sinon.stub();
    addRemote = sinon.stub();

    simpleGit.simpleGit.withArgs(projectRoot).returns({checkIsRepo, init, remote, listRemote, addRemote});
  });

  teardown(() => sandbox.restore());

  suite('initialization', () => {
    const repoHost = `F${any.word()})O${any.word()}O`;
    const repoOwner = any.word();
    const githubAccount = any.word();
    const projectName = any.word();

    test('that the git repo is initialized', async () => {
      const vcsHosts = any.simpleObject();
      checkIsRepo.withArgs('root').resolves(false);
      prompts.promptForVcsHostDetails
        .withArgs(vcsHosts, visibility)
        .resolves({[questionNames.REPO_HOST]: repoHost, [questionNames.REPO_OWNER]: repoOwner});

      const hostDetails = await initialize(true, projectRoot, projectName, vcsHosts, visibility);

      assert.calledOnce(init);
      assert.deepEqual(hostDetails, {host: repoHost.toLowerCase(), owner: repoOwner, name: projectName});
    });

    test('that the git repo is not initialized if the project will not be versioned', async () => {
      const decisions = any.simpleObject();
      checkIsRepo.withArgs('root').resolves(false);
      prompts.promptForVcsHostDetails
        .withArgs(githubAccount, visibility, decisions)
        .resolves({[questionNames.REPO_HOST]: repoHost, [questionNames.REPO_OWNER]: repoOwner});

      const hostDetails = await initialize(false, projectRoot, projectName, githubAccount, visibility, decisions);

      assert.notCalled(init);
      assert.isUndefined(hostDetails);
    });

    test('that the git details are returned from an existing repository', async () => {
      checkIsRepo.withArgs('root').resolves(true);
      const repoName = any.word();
      const remoteOrigin = any.url();
      remote.withArgs(['get-url', 'origin']).resolves(remoteOrigin);
      hostedGitInfo.fromUrl
        .withArgs(remoteOrigin)
        .returns({user: repoOwner, project: repoName, type: repoHost.toLowerCase()});

      const hostDetails = await initialize(true, projectRoot, projectName, githubAccount, visibility);

      assert.notCalled(init);
      assert.deepEqual(hostDetails, {host: repoHost.toLowerCase(), owner: repoOwner, name: repoName});
    });
  });

  suite('scaffold', () => {
    setup(() => {
      listRemote.resolves(any.listOf(any.word));
    });

    test('that the git repo is initialized', async () => {
      fs.writeFile.resolves();

      const results = await scaffold({projectRoot, origin: {}});

      assert.calledWith(fs.writeFile, `${projectRoot}/.gitattributes`, '* text=auto');
      assert.neverCalledWith(fs.writeFile, `${projectRoot}/.gitignore`);
      assert.notCalled(init);

      assert.deepEqual(results.nextSteps, [{summary: 'Commit scaffolded files'}]);
    });

    test('that ignore file is created when patterns are defined', () => {
      const directories = any.listOf(any.string);
      const files = any.listOf(any.string);
      fs.writeFile.resolves();

      return scaffold({projectRoot, ignore: {directories, files}, origin: {}}).then(() => assert.calledWith(
        fs.writeFile,
        `${projectRoot}/.gitignore`,
        `${directories.join('\n')}\n\n${files.join('\n')}`
      ));
    });

    test('that the remote origin is defined when an ssl-url is provided for the remote', async () => {
      const sshUrl = any.url();
      // const branch = any.simpleObject();
      // gitBranch.lookup.withArgs(repository, 'master', gitBranch.BRANCH.LOCAL).resolves(branch);
      init.resolves();

      const results = await scaffold({projectRoot, origin: {sshUrl}});

      assert.calledWith(addRemote, 'origin', sshUrl);
      assert.deepEqual(
        results.nextSteps,
        [{summary: 'Commit scaffolded files'}, {summary: 'Set local `master` branch to track upstream `origin/master`'}]
      );
      // assert.calledWith(gitBranch.setUpstream, branch, 'origin/master');
    });

    test('that the remote origin is not defined if it already exists', async () => {
      const sshUrl = any.url();
      listRemote.resolves(['origin']);

      await scaffold({projectRoot, origin: {sshUrl}});

      assert.notCalled(addRemote);
      // assert.notCalled(gitBranch.lookup);
      // assert.notCalled(gitBranch.setUpstream);
    });
  });
});
