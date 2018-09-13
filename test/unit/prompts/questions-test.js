import path from 'path';
import inquirer from 'inquirer';
import spdxLicenseList from 'spdx-license-list/simple';
import any from '@travi/any';
import {assert} from 'chai';
import sinon from 'sinon';
import {
  copyrightInformationShouldBeRequested,
  licenseChoicesShouldBePresented,
  unlicensedConfirmationShouldBePresented
} from '../../../src/prompts/conditionals';
import {promptForBaseDetails, promptForLanguageDetails, promptForVcsHostDetails} from '../../../src/prompts/questions';
import {questionNames} from '../../../src/prompts/question-names';

suite('project scaffolder prompts', () => {
  let sandbox;
  const projectPath = any.string();
  const answers = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(path, 'basename');
    sandbox.stub(inquirer, 'prompt');
  });

  teardown(() => sandbox.restore());

  suite('base details', () => {
    test('that the user is prompted for the necessary details', async () => {
      const directoryName = any.string();
      const copyrightHolder = any.string();
      path.basename.withArgs(projectPath).returns(directoryName);
      inquirer.prompt
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
            when: unlicensedConfirmationShouldBePresented,
            default: true
          },
          {
            name: questionNames.LICENSE,
            message: 'How should this this project be licensed (https://choosealicense.com/)?',
            type: 'list',
            when: licenseChoicesShouldBePresented,
            choices: Array.from(spdxLicenseList),
            default: 'MIT'
          },
          {
            name: questionNames.COPYRIGHT_HOLDER,
            message: 'Who is the copyright holder of this project?',
            when: copyrightInformationShouldBeRequested,
            default: copyrightHolder
          },
          {
            name: questionNames.COPYRIGHT_YEAR,
            message: 'What is the copyright year?',
            when: copyrightInformationShouldBeRequested,
            default: new Date().getFullYear()
          },
          {
            name: questionNames.GIT_REPO,
            type: 'confirm',
            default: true,
            message: 'Should a git repository be initialized?'
          }
        ])
        .resolves(answers);

      assert.equal(await promptForBaseDetails(projectPath, copyrightHolder), answers);
    });
  });

  suite('vcs host details', () => {
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
      hostPrompt.returns(hostAnswers);
      inquirer.prompt
        .withArgs([
          {
            name: questionNames.REPO_HOST,
            type: 'list',
            message: 'Where will the repository be hosted?',
            choices: [...Object.keys(hosts), new inquirer.Separator(), 'Other']
          }
        ])
        .resolves(answersWithHostChoice);

      assert.deepEqual(await promptForVcsHostDetails(hosts), {...answersWithHostChoice, ...hostAnswers});
    });

    test('that choosing `Other` does not error trying to prompt for host details', async () => {
      const answersWithHostChoice = {...answers, [questionNames.REPO_HOST]: 'Other'};
      inquirer.prompt
        .withArgs([
          {
            name: questionNames.REPO_HOST,
            type: 'list',
            message: 'Where will the repository be hosted?',
            choices: [new inquirer.Separator(), 'Other']
          }
        ])
        .resolves(answersWithHostChoice);

      assert.deepEqual(await promptForVcsHostDetails({}), answersWithHostChoice);
    });
  });

  suite('language details', () => {
    test('that the user is prompted for the language details', async () => {
      const languages = any.simpleObject();
      inquirer.prompt
        .withArgs([
          {
            name: questionNames.PROJECT_TYPE,
            type: 'list',
            message: 'What type of project is this?',
            choices: [...Object.keys(languages), new inquirer.Separator(), 'Other']
          }
        ])
        .resolves(answers);

      assert.equal(await promptForLanguageDetails(languages), answers);
    });
  });
});
