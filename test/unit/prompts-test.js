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
} from '../../src/prompt-conditionals';
import {prompt, questionNames} from '../../src/prompts';

suite('project scaffolder prompts', () => {
  let sandbox;
  const projectPath = any.string();

  setup(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(path, 'basename');
    sandbox.stub(inquirer, 'prompt');
  });

  teardown(() => sandbox.restore());

  test('that the user is prompted for the necessary details', () => {
    const directoryName = any.string();
    path.basename.withArgs(projectPath).returns(directoryName);
    inquirer.prompt.resolves({});

    return prompt(projectPath).then(() => assert.calledWith(
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
          message: 'How should this this project be licensed?',
          type: 'list',
          when: licenseChoicesShouldBePresented,
          choices: Array.from(spdxLicenseList),
          default: 'MIT'
        },
        {
          name: questionNames.COPYRIGHT_HOLDER,
          message: 'Who is the copyright holder of this project?',
          when: copyrightInformationShouldBeRequested,
          default: 'Matt Travi'
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
          name: questionNames.PROJECT_TYPE,
          type: 'list',
          message: 'What type of project is this?',
          choices: ['JavaScript', 'Other']
        },
        {
          name: questionNames.CI,
          type: 'list',
          message: 'Which continuous integration service will be used?',
          choices: ['Travis', 'GitLab CI']
        }
      ]
    ));
  });
});
