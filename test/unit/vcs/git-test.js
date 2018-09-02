import {Repository as gitRepository} from 'nodegit';
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
    sandbox.stub(prompts, 'promptForVcsHostDetails');

    gitRepository.init.resolves();
  });

  teardown(() => sandbox.restore());

  suite('initialization', () => {
    test('that the git repo is initialized', async () => {
      const repoHost = any.word();
      const repoOwner = any.word();
      const githubAccount = any.word();
      const projectName = any.word();
      prompts.promptForVcsHostDetails
        .withArgs(githubAccount)
        .resolves({[questionNames.REPO_HOST]: repoHost, [questionNames.REPO_OWNER]: repoOwner});

      const hostDetails = await initialize(true, projectRoot, projectName, githubAccount);

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

      return scaffold({projectRoot}).then(() => {
        assert.calledWith(fs.writeFile, `${projectRoot}/.gitattributes`, '* text=auto');
        assert.neverCalledWith(fs.writeFile, `${projectRoot}/.gitignore`);
      });
    });

    test('that ignore file is created when patterns are defined', () => {
      const directories = any.listOf(any.string);
      const files = any.listOf(any.string);
      fs.writeFile.resolves();

      return scaffold({projectRoot, ignore: {directories, files}}).then(() => assert.calledWith(
        fs.writeFile,
        `${projectRoot}/.gitignore`,
        `${directories.join('\n')}\n\n${files.join('\n')}`
      ));
    });
  });
});
