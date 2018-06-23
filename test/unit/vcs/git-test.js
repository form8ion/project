import {Repository as gitRepository} from 'nodegit';
import fs from 'mz/fs';
import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import {initialize, scaffold} from '../../../src/vcs/git';

suite('scaffold git', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
    sandbox.stub(gitRepository, 'init');

    gitRepository.init.resolves();
  });

  teardown(() => sandbox.restore());

  suite('initialization', () => {
    test('that the git repo is initialized', async () => {
      await initialize(projectRoot);

      assert.calledWith(gitRepository.init, projectRoot, 0);
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
