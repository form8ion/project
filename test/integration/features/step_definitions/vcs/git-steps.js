import {exists} from 'mz/fs';
import {promises} from 'fs';
import {Given, Then} from 'cucumber';
import {assert} from 'chai';
import {questionNames} from '../../../../../src/prompts/question-names';

Given(/^the project should be versioned in git$/, async function () {
  this.setAnswerFor(questionNames.GIT_REPO, true);
});

Given(/^the project should not be versioned in git$/, async function () {
  this.setAnswerFor(questionNames.GIT_REPO, false);
});

Then(/^the base git files should be present$/, async function () {
  const gitAttributes = await promises.readFile(`${process.cwd()}/.gitattributes`);

  assert.equal(gitAttributes, '* text=auto');
  // assert.isTrue(gitDirectoryStats.isDirectory());
});

Then(/^the base git files should not be present$/, async function () {
  assert.isFalse(await exists(`${process.cwd()}/.git`));
  assert.isFalse(await exists(`${process.cwd()}/.gitattributes`));
  assert.isFalse(await exists(`${process.cwd()}/.gitignore`));
});
