import {Remote as gitRemote, Repository as gitRepository} from 'nodegit';
import fs from 'mz/fs';
import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import {initialize, scaffold} from '../../../src/vcs/git';
import * as prompts from '../../../src/prompts/questions';
import {questionNames} from '../../../src/prompts/question-names';

suite('scaffold git', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
    sandbox.stub(gitRepository, 'init');
    sandbox.stub(gitRepository, 'open');
    sandbox.stub(gitRemote, 'create');
    sandbox.stub(prompts, 'promptForVcsHostDetails');

    gitRepository.init.resolves();
  });

  teardown(() => sandbox.restore());

  suite('initialization', () => {
    test('that the git repo is initialized', async () => {
      const repoHost = any.word();
      const repoOwner = any.word();
      const projectName = any.word();
      const vcsHosts = any.simpleObject();
      prompts.promptForVcsHostDetails
        .withArgs(vcsHosts)
        .resolves({[questionNames.REPO_HOST]: repoHost, [questionNames.REPO_OWNER]: repoOwner});

      const hostDetails = await initialize(true, projectRoot, projectName, vcsHosts);

      assert.calledWith(gitRepository.init, projectRoot, 0);
      assert.deepEqual(hostDetails, {host: repoHost, owner: repoOwner, name: projectName});
    });

    test('that the git repo is not initialized if it shouldnt be', async () => {
      const repoHost = any.word();
      const repoOwner = any.word();
      const githubAccount = any.word();
      const projectName = any.word();
      prompts.promptForVcsHostDetails
        .withArgs(githubAccount)
        .resolves({[questionNames.REPO_HOST]: repoHost, [questionNames.REPO_OWNER]: repoOwner});

      const hostDetails = await initialize(false, projectRoot, projectName, githubAccount);

      assert.notCalled(gitRepository.init);
      assert.deepEqual(hostDetails, {});
    });
  });

  suite('scaffold', () => {
    test('that the git repo is initialized', () => {
      fs.writeFile.resolves();

      return scaffold({projectRoot, origin: {}}).then(() => {
        assert.calledWith(fs.writeFile, `${projectRoot}/.gitattributes`, '* text=auto');
        assert.neverCalledWith(fs.writeFile, `${projectRoot}/.gitignore`);
        assert.notCalled(gitRemote.create);
      });
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
      const repository = any.simpleObject();
      const sslUrl = any.url();
      gitRepository.open.withArgs(projectRoot).resolves(repository);
      gitRemote.create.resolves();

      await scaffold({projectRoot, origin: {sslUrl}});

      assert.calledWith(gitRemote.create, repository, 'origin', sslUrl);
    });
  });
});
