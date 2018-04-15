import {basename} from 'path';
import {prompt as promptWithInquirer} from 'inquirer';
import spdxLicenseList from 'spdx-license-list/simple';
import {
  copyrightInformationShouldBeRequested,
  licenseChoicesShouldBePresented,
  unlicensedConfirmationShouldBePresented,
  vcsHostPromptShouldBePresented
} from './prompt-conditionals';

export const questionNames = {
  PROJECT_NAME: 'projectName',
  DESCRIPTION: 'description',
  VISIBILITY: 'visibility',
  GIT_REPO: 'gitRepo',
  REPO_HOST: 'repoHost',
  UNLICENSED: 'unlicensed',
  LICENSE: 'license',
  COPYRIGHT_HOLDER: 'copyrightHolder',
  COPYRIGHT_YEAR: 'copyrightYear',
  PROJECT_TYPE: 'projectType',
  CI: 'ci'
};

const licenseQuestions = [
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
  }
];

const vcsQuestions = [
  {name: questionNames.GIT_REPO, type: 'confirm', default: true, message: 'Should a git repository be initialized?'},
  {
    name: questionNames.REPO_HOST,
    type: 'list',
    when: vcsHostPromptShouldBePresented,
    message: 'Where will the repository be hosted?',
    choices: ['GitHub', 'BitBucket', 'GitLab', 'KeyBase']
  }
];


export function prompt(projectRoot) {
  return promptWithInquirer([
    {name: questionNames.PROJECT_NAME, message: 'What is the name of this project?', default: basename(projectRoot)},
    {name: questionNames.DESCRIPTION, message: 'How should this project be described?'},
    {
      name: questionNames.VISIBILITY,
      message: 'Should this project be public or private?',
      type: 'list',
      choices: ['Public', 'Private'],
      default: 'Private'
    },
    ...licenseQuestions,
    ...vcsQuestions,
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
  ]);
}
