import {promises as fs} from 'node:fs';

import {After, Before, Given, Then} from '@cucumber/cucumber';
import sinon from 'sinon';
import any from '@travi/any';
import {fileExists} from '@form8ion/core';

let updaterScaffolder, updaterLifter;

Before(function () {
  updaterScaffolder = sinon.stub();
  updaterLifter = sinon.stub();
});

After(function () {
  updaterScaffolder = null;
});

Given('a dependency updater can be chosen', async function () {
  const filename = any.word();
  this.updatePlugin = {
    scaffold: async ({projectRoot}) => {
      updaterScaffolder();
      await fs.writeFile(`${projectRoot}/${filename}.txt`, any.sentence());
    },
    lift: foo => {
      updaterLifter(foo);
      return any.simpleObject();
    },
    test: async ({projectRoot}) => fileExists(`${projectRoot}/${filename}.txt`)
  };
});

Then('the dependency updater was executed', async function () {
  sinon.assert.calledOnce(updaterScaffolder);
  sinon.assert.calledOnce(updaterLifter);
});

Then('the dependency updater was not executed', async function () {
  sinon.assert.notCalled(updaterScaffolder);
  sinon.assert.notCalled(updaterLifter);
});
