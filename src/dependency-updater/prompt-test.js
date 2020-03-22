import * as prompts from '@form8ion/overridable-prompts';
import any from '@travi/any';
import {Separator} from 'inquirer';
import {assert} from 'chai';
import sinon from 'sinon';
import {questionNames} from '..';
import {promptForDependencyUpdaterChoice} from './prompt';

suite('dependency updater prompt', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(prompts, 'prompt');
  });

  teardown(() => sandbox.restore());

  test('that the preferred updater can be chosen', async () => {
    const answers = any.simpleObject();
    const updaters = any.simpleObject();
    const decisions = any.simpleObject();
    prompts.prompt
      .withArgs([{
        name: questionNames.DEPENDENCY_UPDATER,
        type: 'list',
        message: 'Which dependency-update service do you want to manage this project?',
        choices: [...Object.keys(updaters), new Separator(), 'Other']
      }], decisions)
      .resolves(answers);

    assert.equal(await promptForDependencyUpdaterChoice(updaters, decisions), answers);
  });
});
