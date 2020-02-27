import path from 'path';
import {Separator} from 'inquirer';
import spdxLicenseList from 'spdx-license-list/simple';
import * as prompts from '@form8ion/overridable-prompts';
import any from '@travi/any';
import {assert} from 'chai';
import sinon from 'sinon';
import * as conditionals from './conditionals';
import {promptForBaseDetails, promptForLanguageDetails, promptForVcsHostDetails} from './questions';
import {questionNames} from './question-names';

suite('project scaffolder prompts', () => {
  let sandbox;
  const projectPath = any.string();
  const answers = any.simpleObject();
  const decisions = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(path, 'basename');
    sandbox.stub(prompts, 'prompt');
    sandbox.stub(prompts, 'questionHasDecision');
    sandbox.stub(conditionals, 'filterChoicesByVisibility');

    prompts.questionHasDecision.returns(false);
  });

  teardown(() => sandbox.restore());

  suite('base details', () => {
    test('that the user is prompted for the necessary details', async () => {
      const directoryName = any.string();
      const copyrightHolder = any.string();
      path.basename.withArgs(projectPath).returns(directoryName);
      prompts.prompt
        .withArgs([
          {name: questionNames.PROJECT_NAME, message: 'What is the name of this project?', default: directoryName},
          {
            name: questionNames.DESCRIPTION,
            message: 'How should this project be described?'
          },
          {
            name: questionNames.VISIBILITY,
            message: 'Should this project be public or private?',
            type: 'list',
            choices: ['Public', 'Private'],
            default: 'Private'
          },
          {
            name: questionNames.UNLICENSED,
            message: 'Since this is a private project, should it be unlicensed?',
            type: 'confirm',
            when: conditionals.unlicensedConfirmationShouldBePresented,
            default: true
          },
          {
            name: questionNames.LICENSE,
            message: 'How should this this project be licensed (https://choosealicense.com/)?',
            type: 'list',
            when: conditionals.licenseChoicesShouldBePresented,
            choices: Array.from(spdxLicenseList),
            default: 'MIT'
          },
          {
            name: questionNames.COPYRIGHT_HOLDER,
            message: 'Who is the copyright holder of this project?',
            when: conditionals.copyrightInformationShouldBeRequested,
            default: copyrightHolder
          },
          {
            name: questionNames.COPYRIGHT_YEAR,
            message: 'What is the copyright year?',
            when: conditionals.copyrightInformationShouldBeRequested,
            default: new Date().getFullYear()
          },
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

    test('that license questions are skipped when a visibility decision is provided', async () => {
      const directoryName = any.string();
      const copyrightHolder = any.string();
      path.basename.withArgs(projectPath).returns(directoryName);
      prompts.questionHasDecision.withArgs(questionNames.VISIBILITY, decisions).returns(true);
      prompts.prompt
        .withArgs([
          {name: questionNames.PROJECT_NAME, message: 'What is the name of this project?', default: directoryName},
          {
            name: questionNames.DESCRIPTION,
            message: 'How should this project be described?'
          },
          {
            name: questionNames.VISIBILITY,
            message: 'Should this project be public or private?',
            type: 'list',
            choices: ['Public', 'Private'],
            default: 'Private'
          },
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

  suite('vcs host details', () => {
    const filteredHostChoices = any.listOf(any.word);

    test('that the user is prompted for the vcs hosting details', async () => {
      const host = any.string();
      const hostNames = [...any.listOf(any.string), host];
      const hostPrompt = sinon.stub();
      const hosts = any.objectWithKeys(
        hostNames,
        {factory: key => ({prompt: host === key ? hostPrompt : () => undefined})}
      );
      const answersWithHostChoice = {...answers, [questionNames.REPO_HOST]: host};
      const hostAnswers = any.simpleObject();
      hostPrompt.withArgs({decisions}).returns(hostAnswers);
      conditionals.filterChoicesByVisibility.withArgs(hosts).returns(filteredHostChoices);
      prompts.prompt
        .withArgs([
          {
            name: questionNames.REPO_HOST,
            type: 'list',
            message: 'Where will the repository be hosted?',
            choices: filteredHostChoices
          }
        ], decisions)
        .resolves(answersWithHostChoice);

      assert.deepEqual(
        await promptForVcsHostDetails(hosts, null, decisions),
        {...answersWithHostChoice, ...hostAnswers}
      );
    });

    test('that choosing `Other` does not error trying to prompt for host details', async () => {
      const hosts = {};
      const visibility = any.word();
      const answersWithHostChoice = {...answers, [questionNames.REPO_HOST]: 'Other'};
      conditionals.filterChoicesByVisibility.withArgs(hosts, visibility).returns(filteredHostChoices);
      prompts.prompt
        .withArgs([
          {
            name: questionNames.REPO_HOST,
            type: 'list',
            message: 'Where will the repository be hosted?',
            choices: filteredHostChoices
          }
        ], decisions)
        .resolves(answersWithHostChoice);

      assert.deepEqual(await promptForVcsHostDetails(hosts, visibility, decisions), answersWithHostChoice);
    });
  });

  suite('language details', () => {
    test('that the user is prompted for the language details', async () => {
      const languages = any.simpleObject();
      prompts.prompt
        .withArgs([
          {
            name: questionNames.PROJECT_TYPE,
            type: 'list',
            message: 'What type of project is this?',
            choices: [...Object.keys(languages), new Separator(), 'Other']
          }
        ], decisions)
        .resolves(answers);

      assert.equal(await promptForLanguageDetails(languages, decisions), answers);
    });
  });
});
