import any from '@travi/any';
import * as readme from '@form8ion/readme';
import sinon from 'sinon';
import {assert} from 'chai';
import scaffoldReadme from './readme';

suite('scaffold readme', () => {
  let sandbox;
  const projectName = any.word();
  const projectRoot = any.word();
  const description = any.word();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(readme, 'scaffold');
    sandbox.stub(readme, 'lift');
  });

  teardown(() => sandbox.restore());

  test('that the README created and lifted', async () => {
    const badges = any.simpleObject();
    const documentation = any.simpleObject();

    await scaffoldReadme({projectName, projectRoot, description, badges, documentation});

    assert.calledWith(readme.scaffold, {projectRoot, projectName, description});
    assert.calledWith(readme.lift, {projectRoot, results: {badges, documentation}});
  });
});
