import {promises as fs} from 'node:fs';

import {GitError} from 'simple-git';
import makeDir from 'make-dir';
import {fileExists} from '@form8ion/core';

import {Given, Then} from '@cucumber/cucumber';
import {assert} from 'chai';
import * as td from 'testdouble';
import any from '@travi/any';

import {questionNames} from '../../../../../src/prompts/question-names.js';

const simpleGitInstance = td.object(['checkIsRepo', 'listRemote', 'remote', 'addRemote', 'init']);

Given(/^the project should be versioned in git$/, async function () {
  this.setAnswerFor(questionNames.GIT_REPO, true);
  this.setAnswerFor(questionNames.REPO_HOST, 'Other');

  td.when(this.git.simpleGit(process.cwd())).thenReturn(simpleGitInstance);
  td.when(simpleGitInstance.checkIsRepo('root')).thenResolve(false);
  td.when(simpleGitInstance.listRemote())
    .thenReject(new GitError(null, 'fatal: No remote configured to list refs from.\n'));
});

Given(/^the project should not be versioned in git$/, async function () {
  this.setAnswerFor(questionNames.GIT_REPO, false);
});

Given('the project root is already initialized as a git repository', async function () {
  await makeDir(`${process.cwd()}/.git`);
  this.setAnswerFor(questionNames.GIT_REPO, true);
  this.setAnswerFor(questionNames.REPO_HOST, undefined);

  td.when(this.git.simpleGit(process.cwd())).thenReturn(simpleGitInstance);
  td.when(simpleGitInstance.checkIsRepo('root')).thenResolve(true);
  td.when(simpleGitInstance.listRemote()).thenResolve(['origin']);
  td.when(simpleGitInstance.remote(['get-url', 'origin']))
    .thenResolve(`git@github.com:${any.word()}/${this.projectName}.git`);
});

Given('no additional ignores are provided for vcs', async function () {
  return undefined;
});

Given('additional files are provided to be ignored from vcs', async function () {
  this.vcsIgnoreFiles = any.listOf(any.word);
});

Given('additional directories are provided to be ignored from vcs', async function () {
  this.vcsIgnoreDirectories = any.listOf(any.word);
});

Then('the directory is initialized as a git repository', async function () {
  td.verify(simpleGitInstance.init());
});

Then('the remote origin is defined', async function () {
  td.verify(simpleGitInstance.addRemote('origin', this.remoteOriginUrl));
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

Then('the additional ignores are added to the gitignore', async function () {
  const gitIgnoreContent = await fs.readFile(`${process.cwd()}/.gitignore`, 'utf-8');

  assert.equal(gitIgnoreContent, `${this.vcsIgnoreDirectories.join('\n')}\n\n${this.vcsIgnoreFiles.join('\n')}`);
});

Then('the gitignore file is unchanged', async function () {
  const gitIgnoreContent = await fs.readFile(`${process.cwd()}/.gitignore`, 'utf-8');

  assert.equal(gitIgnoreContent, '');
});
