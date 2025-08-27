import {Given, Then} from '@cucumber/cucumber';
import any from '@travi/any';
import {assert} from 'chai';

import {questionNames} from '../../../../../src/prompts/question-names.js';

Given('the git repository will be hosted', async function () {
  const vcsHost = any.word();

  this.setAnswerFor(questionNames.REPO_HOST, vcsHost);
  this.remoteOriginUrl = any.url();
  this.repoHost = vcsHost;
});

Given('the repository is hosted on {string}', async function (host) {
  this.repoHost = host;
  this.vcsOwner = any.word();
  this.vcsName = any.word();
  this.setAnswerFor(questionNames.REPO_HOST, this.repoHost);
});

Then('the project repository is hosted on the chosen host', async function () {
  assert.deepEqual(this.hostedVcsDetails, {name: this.projectName, host: this.repoHost});
  assert.equal(this.vcsHostProjectHomepage, this.projectHomepage);
});
