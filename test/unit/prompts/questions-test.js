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
  unlicensedConfirmationShouldBePresented,
  vcsHostPromptShouldBePresented
} from '../../../src/prompts/conditionals';
import {promptForBaseDetails, promptForLanguageDetails} from '../../../src/prompts/questions';
import {questionNames} from '../../../src/prompts/question-names';

suite('project scaffolder prompts', () => {
  let sandbox;
  const projectPath = any.string();
  const githubUser = any.word();

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
      const languages = any.simpleObject();
      const copyrightHolder = any.string();
      path.basename.withArgs(projectPath).returns(directoryName);
      inquirer.prompt.resolves({});
      gitConfig.sync.returns({});

      return promptForBaseDetails(projectPath, languages, {copyrightHolder}).then(() => assert.calledWith(
        inquirer.prompt,
        [
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
          },
          {
            name: questionNames.REPO_HOST,
            type: 'list',
            when: vcsHostPromptShouldBePresented,
            message: 'Where will the repository be hosted?',
            choices: ['GitHub', 'BitBucket', 'GitLab', 'KeyBase']
          },
          {
            name: questionNames.REPO_OWNER,
            message: 'What is the id of the repository owner?',
            default: ''
          },
          {
            name: questionNames.PROJECT_TYPE,
            type: 'list',
            message: 'What type of project is this?',
            choices: [...Object.keys(languages), 'Other']
          }
        ]
      ));
    });
  });

  suite('vcs details', () => {
    test('that the github user is provided as the default owner value if available in the global config', () => {
      gitConfig.sync.returns({github: {user: githubUser}});
      inquirer.prompt.resolves({});

      return promptForBaseDetails(projectPath, {}, {}).then(() => assert.calledWith(
        inquirer.prompt,
        sinon.match(value => 1 === value.filter(question => githubUser === question.default).length)
      ));
    });

    test('that the github user is not used as the default owner value an override is provided', () => {
      const githubAccount = any.word();
      gitConfig.sync.returns({github: {user: githubUser}});
      inquirer.prompt.resolves({});

      return promptForBaseDetails(projectPath, {}, {githubAccount}).then(() => assert.calledWith(
        inquirer.prompt,
        sinon.match(value => 1 === value.filter(question => githubAccount === question.default).length)
      ));
    });
  });

  suite('language details', () => {
    test('that the user is prompted for the language details', async () => {
      const languages = any.simpleObject();
      const answers = any.listOf(any.string);
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
