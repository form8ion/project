import {readFile} from 'mz/fs';
import {Given, Then} from 'cucumber';
import bddStdIn from 'bdd-stdin';
import {assert} from 'chai';

Given('the project should be versioned in git', async function () {
  bddStdIn(
    'project-name',
    'some project description',
    bddStdIn.keys.down, '\n', '\n',
    'y', '\n',
    'y', '\n',
    '\n', '\n',
    bddStdIn.keys.down, '\n', '\n'
  );
});

Then('the base git files should be present', async function () {
  const gitAttributes = await readFile(`${process.cwd()}/.gitattributes`);

  assert.equal(gitAttributes, '* text=auto');
});
