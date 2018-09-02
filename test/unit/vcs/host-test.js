import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as githubScaffolder from '../../../src/vcs/github';
import scaffoldVcsHost from '../../../src/vcs/host';

suite('vcs host scaffolder', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(githubScaffolder, 'default');
  });

  teardown(() => sandbox.restore());

  test('that hosting details are returned', async () => {
    await scaffoldVcsHost({host: any.string()});

    assert.notCalled(githubScaffolder.default);
  });

  test('that github is scaffolded if github was chosen as the host', async () => {
    const otherOptions = any.simpleObject();
    const results = any.simpleObject();
    githubScaffolder.default.withArgs(otherOptions).resolves(results);

    await scaffoldVcsHost({...otherOptions, host: 'GitHub'});
  });
});
