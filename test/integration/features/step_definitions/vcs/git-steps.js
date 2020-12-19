import {exists} from 'mz/fs';
import {promises} from 'fs';
import {Given, Then} from 'cucumber';
import {assert} from 'chai';
import td from 'testdouble';
import any from '@travi/any';
import {questionNames} from '../../../../../src/prompts/question-names';

const nodegitRepository = any.simpleObject();

Given(/^the project should be versioned in git$/, async function () {
  this.setAnswerFor(questionNames.GIT_REPO, true);
  td.when(this.nodegit.Repository.open(process.cwd())).thenResolve(nodegitRepository);
  td.when(this.nodegit.Remote.list(nodegitRepository)).thenResolve([]);
});

Given(/^the project should not be versioned in git$/, async function () {
  this.setAnswerFor(questionNames.GIT_REPO, false);
});

Then(/^the base git files should be present$/, async function () {
  const gitAttributes = await promises.readFile(`${process.cwd()}/.gitattributes`);

  assert.equal(gitAttributes, '* text=auto');
  td.verify(this.nodegit.Repository.init(process.cwd(), 0));
  // assert.isTrue(gitDirectoryStats.isDirectory());
});

Then(/^the base git files should not be present$/, async function () {
  assert.isFalse(await exists(`${process.cwd()}/.git`));
  assert.isFalse(await exists(`${process.cwd()}/.gitattributes`));
  assert.isFalse(await exists(`${process.cwd()}/.gitignore`));
});
