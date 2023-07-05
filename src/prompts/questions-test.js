import path from 'path';
import * as core from '@form8ion/core';
import * as prompts from '@form8ion/overridable-prompts';
import any from '@travi/any';
import {assert} from 'chai';
import sinon from 'sinon';
import * as conditionals from './conditionals';
import {promptForBaseDetails} from './questions';
import {questionNames} from './question-names';

suite('project scaffolder prompts', () => {
  let sandbox;
  const projectPath = any.string();
  const answers = any.simpleObject();
  const decisions = any.simpleObject();
  const questions = any.listOf(any.simpleObject);

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(path, 'basename');
    sandbox.stub(prompts, 'prompt');
    sandbox.stub(prompts, 'questionHasDecision');
    sandbox.stub(conditionals, 'filterChoicesByVisibility');
    sandbox.stub(core, 'questionsForBaseDetails');

    prompts.questionHasDecision.returns(false);
  });

  teardown(() => sandbox.restore());

  test('that the user is prompted for the necessary details', async () => {
    const directoryName = any.string();
    const copyrightHolder = any.string();
    path.basename.withArgs(projectPath).returns(directoryName);
    core.questionsForBaseDetails.withArgs(decisions, projectPath, copyrightHolder).returns(questions);
    prompts.prompt
      .withArgs([
        ...questions,
        {
          name: questionNames.GIT_REPO,
          type: 'confirm',
          default: true,
          message: 'Should a git repository be initialized?'
        }
      ], decisions)
      .resolves(answers);

    assert.equal(await promptForBaseDetails(projectPath, copyrightHolder, decisions), answers);
  });
});
