import {Given} from '@cucumber/cucumber';
import any from '@travi/any';

import {questionNames} from '../../../../../src/prompts/question-names.mjs';

Given('the git repository will be hosted', async function () {
  this.setAnswerFor(questionNames.REPO_HOST, any.word());
  this.remoteOriginUrl = any.url();
});
