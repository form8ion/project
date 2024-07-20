import {Given} from '@cucumber/cucumber';
import any from '@travi/any';

import {questionNames} from '../../../../../src/prompts/question-names.js';

Given('the git repository will be hosted', async function () {
  this.setAnswerFor(questionNames.REPO_HOST, any.word());
  this.remoteOriginUrl = any.url();
});

Given('the repository is hosted on {string}', async function (host) {
  this.repoHost = host;
  this.vcsOwner = any.word();
  this.vcsName = any.word();
});
