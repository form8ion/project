import any from '@travi/any';
import {assert} from 'chai';
import sinon from 'sinon';
import scaffoldUpdater from './dependency-updater-scaffolder';

suite('dependency-updater scaffolder', () => {
  test('that the chosen scaffolder is executed with the appropriate options', async () => {
    const options = any.simpleObject();
    const chosenUpdater = any.word();
    const chosenUpdaterScaffolder = sinon.stub();
    const scaffolders = {...any.simpleObject(), [chosenUpdater]: chosenUpdaterScaffolder};
    const scaffolderResult = any.simpleObject();
    chosenUpdaterScaffolder.withArgs(options).resolves(scaffolderResult);

    assert.equal(await scaffoldUpdater(scaffolders, chosenUpdater, options), scaffolderResult);
  });

  test('that that choosing an updater without a defined scaffolder does not result in an error', () => {
    assert.isUndefined(scaffoldUpdater(any.simpleObject(), any.word(), any.simpleObject()));
  });
});
