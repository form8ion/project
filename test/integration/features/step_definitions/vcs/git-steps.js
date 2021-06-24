import {promises as fs} from 'fs';
import {fileExists} from '@form8ion/core';
import {Given, Then} from '@cucumber/cucumber';
import {assert} from 'chai';
import td from 'testdouble';
import any from '@travi/any';
import makeDir from 'make-dir';
import {questionNames} from '../../../../../src/prompts/question-names';

const nodegitRepository = any.simpleObject();

Given(/^the project should be versioned in git$/, async function () {
  this.setAnswerFor(questionNames.GIT_REPO, true);
  this.setAnswerFor(questionNames.REPO_HOST, 'Other');
  td.when(this.nodegit.Repository.open(process.cwd())).thenResolve(nodegitRepository);
  td.when(this.nodegit.Remote.list(nodegitRepository)).thenResolve([]);
});

Given(/^the project should not be versioned in git$/, async function () {
  this.setAnswerFor(questionNames.GIT_REPO, false);
});

Given('the project root is already intialized as a git repository', async function () {
  const nodegitRemote = {
    ...any.simpleObject(),
    url() {
      return `git@github.com:${any.word()}/${this.projectName}.git`;
    }
  };

  await makeDir(`${process.cwd()}/.git`);
  this.setAnswerFor(questionNames.GIT_REPO, true);
  this.setAnswerFor(questionNames.REPO_HOST, undefined);
  td.when(this.nodegit.Repository.open(process.cwd())).thenResolve(nodegitRepository);
  td.when(this.nodegit.Remote.list(nodegitRepository)).thenResolve(['origin']);
  td.when(this.nodegit.Remote.lookup(nodegitRepository, 'origin')).thenResolve(nodegitRemote);
});

Then('the directory is initialized as a git repository', async function () {
  td.verify(this.nodegit.Repository.init(process.cwd(), 0));
});

Then(/^the base git files should be present$/, async function () {
  const gitAttributes = await fs.readFile(`${process.cwd()}/.gitattributes`, 'utf-8');

  assert.equal(gitAttributes, '* text=auto');
});

Then(/^the base git files should not be present$/, async function () {
  assert.isFalse(await fileExists(`${process.cwd()}/.git`));
  assert.isFalse(await fileExists(`${process.cwd()}/.gitattributes`));
  assert.isFalse(await fileExists(`${process.cwd()}/.gitignore`));
});
