import deepmerge from 'deepmerge';
import * as core from '@form8ion/core';
import * as readme from '@form8ion/readme';

import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';

import lift from './lift';

suite('lift', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(core, 'applyEnhancers');
    sandbox.stub(readme, 'lift');
    sandbox.stub(deepmerge, 'all');
  });

  teardown(() => sandbox.restore());

  test('that the readme is lifted based on the provided results', async () => {
    const projectRoot = any.string();
    const enhancers = any.simpleObject();
    const vcs = any.simpleObject();
    const results = any.simpleObject();
    const enhancerResults = any.simpleObject();
    const mergedResults = any.simpleObject();
    core.applyEnhancers.withArgs({results, enhancers, options: {projectRoot, vcs}}).resolves(enhancerResults);
    deepmerge.all.withArgs([results, enhancerResults]).returns(mergedResults);

    await lift({projectRoot, results, enhancers, vcs});

    assert.calledWith(readme.lift, {projectRoot, results: mergedResults});
  });
});
