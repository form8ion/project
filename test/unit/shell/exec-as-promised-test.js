import shell from 'shelljs';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import exec from '../../../../../third-party-wrappers/exec-as-promised';

suite('promisified shell.exec()', () => {
  let sandbox;
  const command = any.string();
  const stdout = any.string();
  const stderr = any.string();

  setup(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(shell, 'exec');
  });

  teardown(() => sandbox.restore());

  test('that the `stdout` data is provided upon success', async () => {
    shell.exec.withArgs(command, {silent: true}).yields(0, stdout);

    assert.equal(await exec(command), stdout);
  });

  test('that the exit-code and the `stdout` and `stderr` data is provided upon failure', () => {
    const code = any.integer();
    shell.exec.withArgs(command, {silent: true}).yields(code, stdout, stderr);

    const promise = exec(command);

    return Promise.all([
      assert.isRejected(promise, `script exited with a non-zero exit code (${code})`),
      promise.catch(err => assert.deepEqual(err.data, {code, stdout, stderr}))
    ]);
  });

  test('that default options can be overridden', async () => {
    shell.exec.withArgs(command, {silent: false}).yields(0, stdout);

    assert.equal(await exec(command, {silent: false}), stdout);
  });
});
