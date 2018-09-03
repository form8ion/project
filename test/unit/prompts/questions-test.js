import gitConfig from 'git-config';
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
  const githubUser = any.word();
  const answers = any.listOf(any.string);

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(path, 'basename');
    sandbox.stub(inquirer, 'prompt');
    sandbox.stub(gitConfig, 'sync');
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
      gitConfig.sync.returns({});

      assert.equal(await promptForBaseDetails(projectPath, copyrightHolder), answers);
    });
  });

  suite('vcs host details', () => {
    test('that the user is prompted for the vcs hosting details', async () => {
      const hosts = any.objectWithKeys(any.listOf(any.string));
      gitConfig.sync.returns({});
      inquirer.prompt
        .withArgs([
          {
            name: questionNames.REPO_HOST,
            type: 'list',
            message: 'Where will the repository be hosted?',
            choices: [...Object.keys(hosts), new inquirer.Separator(), 'Other']
          },
          {
            name: questionNames.REPO_OWNER,
            message: 'What is the id of the repository owner?',
            default: ''
          }
        ])
        .resolves(answers);

      assert.equal(await promptForVcsHostDetails(hosts), answers);
    });

    test('that the github user is provided as the default owner value if available in the global config', async () => {
      gitConfig.sync.returns({github: {user: githubUser}});
      inquirer.prompt
        .withArgs(sinon.match(value => 1 === value.filter(question => githubUser === question.default).length))
        .resolves(answers);

      assert.equal(await promptForVcsHostDetails({}), answers);
    });

    test('that the github user is not used as the default owner value an override is provided', async () => {
      const githubAccount = any.word();
      gitConfig.sync.returns({github: {user: githubUser}});
      inquirer.prompt
        .withArgs(sinon.match(value => 1 === value.filter(question => githubAccount === question.default).length))
        .resolves(answers);

      assert.equal(await promptForVcsHostDetails({}, githubAccount), answers);
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
