import {Given, Then} from 'cucumber';
import {assert} from 'chai';
import {promises} from 'fs';
import bddStdIn from 'bdd-stdin';
import {questionNames} from '../../../../../src/prompts/question-names';

Given('the project language should be JavaScript', async function () {
  this.setAnswerFor(questionNames.PROJECT_TYPE, '\n');
  this.setAnswerFor(questionNames.GIT_REPO, '\n');

  bddStdIn(
    'project-name',
    'some project description',
    bddStdIn.keys.down, '\n', '\n',
    'y', '\n',
    'y', '\n',
    this.getAnswerFor(questionNames.GIT_REPO), '\n',
    this.getAnswerFor(questionNames.PROJECT_TYPE),
    '\n',
    '\n',
    bddStdIn.keys.up, '\n',
    '\n',
    '\n',
    '\n',
    'n', '\n',
    'n', '\n'
  );
});

Then('JavaScript ignores are defined', async function () {
  const gitIgnore = await promises.readFile(`${process.cwd()}/.gitignore`);

  assert.equal(gitIgnore, '* text=auto');
});
