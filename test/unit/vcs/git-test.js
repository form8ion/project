import fs from 'mz/fs';
import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import scaffoldGit from '../../../src/vcs/git';

suite('scaffold git', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that the git repo is initialized', () => {
    const projectRoot = any.string();
    fs.writeFile.resolves();

    return scaffoldGit({projectRoot}).then(() => {
      assert.calledWith(fs.writeFile, `${projectRoot}/.gitattributes`, '* text=auto');
      assert.neverCalledWith(fs.writeFile, `${projectRoot}/.gitignore`);
    });
  });

  test('that ignore file is created when patterns are defined', () => {
    const projectRoot = any.string();
    const directories = any.listOf(any.string);
    const files = any.listOf(any.string);
    fs.writeFile.resolves();

    return scaffoldGit({projectRoot, ignore: {directories, files}}).then(() => assert.calledWith(
      fs.writeFile,
      `${projectRoot}/.gitignore`,
      `${directories.join('\n')}\n\n${files.join('\n')}`
    ));
  });
});
