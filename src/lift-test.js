import * as readme from '@form8ion/readme';

import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';

import lift from './lift';

suite('lift', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(readme, 'lift');
  });

  teardown(() => sandbox.restore());

  test('that the readme is lifted based on the provided results', async () => {
    const projectRoot = any.string();
    const results = any.simpleObject();

    await lift({projectRoot, results});

    assert.calledWith(readme.lift, {projectRoot, results});
  });
});
