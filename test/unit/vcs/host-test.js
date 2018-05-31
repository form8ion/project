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

  test('that hosting details are returned', () => {
    const host = any.string();

    return scaffoldVcsHost({host}).then(() => assert.notCalled(githubScaffolder.default));
  });

  test('that github is scaffolded if github was chosen as the host', () => {
    const projectRoot = any.string();
    const projectType = any.string();
    const description = any.sentence();
    const homepage = any.url();
    githubScaffolder.default.resolves();

    return scaffoldVcsHost({host: 'GitHub', projectRoot, projectType, description, homepage})
      .then(() => assert.calledWith(githubScaffolder.default, {projectRoot, projectType, description, homepage}));
  });
});
