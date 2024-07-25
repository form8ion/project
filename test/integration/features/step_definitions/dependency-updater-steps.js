import {After, Before, Given, Then} from '@cucumber/cucumber';
import sinon from 'sinon';

let updaterScaffolder;

Before(function () {
  updaterScaffolder = sinon.stub();
});

After(function () {
  updaterScaffolder = null;
});

Given('a dependency updater can be chosen', async function () {
  this.updatePlugin = {scaffold: foo => updaterScaffolder(foo)};
});

Then('the dependency updater was executed', async function () {
  sinon.assert.calledOnce(updaterScaffolder);
});

Then('the dependency updater was not executed', async function () {
  sinon.assert.notCalled(updaterScaffolder);
});
