import {basename} from 'path';
import {prompt as promptWithInquirer, Separator} from 'inquirer';
import spdxLicenseList from 'spdx-license-list/simple';
import {
  copyrightInformationShouldBeRequested,
  licenseChoicesShouldBePresented,
  unlicensedConfirmationShouldBePresented
} from './conditionals';
import {questionNames} from './question-names';

function includeLicenseQuestions(copyrightHolder) {
  return [
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
    }
  ];
}

export function promptForBaseDetails(projectRoot, copyrightHolder) {
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
    ...includeLicenseQuestions(copyrightHolder),
    {name: questionNames.GIT_REPO, type: 'confirm', default: true, message: 'Should a git repository be initialized?'}
  ]);
}

export function promptForLanguageDetails(languages) {
  return promptWithInquirer([
    {
      name: questionNames.PROJECT_TYPE,
      type: 'list',
      message: 'What type of project is this?',
      choices: [...Object.keys(languages), new Separator(), 'Other']
    }
  ]);
}

export async function promptForVcsHostDetails(hosts) {
  const answers = await promptWithInquirer([
    {
      name: questionNames.REPO_HOST,
      type: 'list',
      message: 'Where will the repository be hosted?',
      choices: [...Object.keys(hosts), new Separator(), 'Other']
    }
  ]);
  const host = hosts[answers[questionNames.REPO_HOST]];

  return {...answers, ...host && await host.prompt()};
}

export async function promptForHostDetails(hosts) {
  return promptWithInquirer([
    {
      name: questionNames.HOST,
      type: 'list',
      message: 'Where will the application be hosted?',
      choices: [...Object.keys(hosts), new Separator(), 'Other']
    }
  ]);
}
