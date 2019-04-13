import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import scaffoldVcsHost from '../../../src/vcs/host';

suite('vcs host scaffolder', () => {
  test('that the chosen vcs host is scaffolded', async () => {
    const chosenHost = any.word();
    const otherOptions = any.simpleObject();
    const results = any.simpleObject();
    const chosenHostScaffolder = sinon.stub();
    const hostScaffolders = {...any.simpleObject(), [chosenHost]: {scaffolder: chosenHostScaffolder}};
    chosenHostScaffolder.withArgs(otherOptions).resolves(results);

    assert.equal(await scaffoldVcsHost(hostScaffolders, {...otherOptions, host: chosenHost}), results);
  });

  test('that that choosing a host without a defined scaffolder does not result in an error', async () => {
    await scaffoldVcsHost(any.simpleObject(), {...any.simpleObject(), host: any.string()});
  });
});
