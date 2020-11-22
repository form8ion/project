import {basename} from 'path';
import {Separator} from 'inquirer';
import {questionNames as coreQuestionNames} from '@form8ion/core';
import {prompt, questionHasDecision} from '@form8ion/overridable-prompts';
import spdxLicenseList from 'spdx-license-list/simple';
import {
  copyrightInformationShouldBeRequested,
  filterChoicesByVisibility,
  licenseChoicesShouldBePresented,
  unlicensedConfirmationShouldBePresented
} from './conditionals';
import {questionNames} from './question-names';

function includeLicenseQuestions(copyrightHolder) {
  return [
    {
      name: coreQuestionNames.UNLICENSED,
      message: 'Since this is a private project, should it be unlicensed?',
      type: 'confirm',
      when: unlicensedConfirmationShouldBePresented,
      default: true
    },
    {
      name: coreQuestionNames.LICENSE,
      message: 'How should this this project be licensed (https://choosealicense.com/)?',
      type: 'list',
      when: licenseChoicesShouldBePresented,
      choices: Array.from(spdxLicenseList),
      default: 'MIT'
    },
    {
      name: coreQuestionNames.COPYRIGHT_HOLDER,
      message: 'Who is the copyright holder of this project?',
      when: copyrightInformationShouldBeRequested,
      default: copyrightHolder
    },
    {
      name: coreQuestionNames.COPYRIGHT_YEAR,
      message: 'What is the copyright year?',
      when: copyrightInformationShouldBeRequested,
      default: new Date().getFullYear()
    }
  ];
}

export function promptForBaseDetails(projectRoot, copyrightHolder, decisions) {
  return prompt([
    {
      name: coreQuestionNames.PROJECT_NAME,
      message: 'What is the name of this project?',
      default: basename(projectRoot)
    },
    {name: coreQuestionNames.DESCRIPTION, message: 'How should this project be described?'},
    {
      name: coreQuestionNames.VISIBILITY,
      message: 'Should this project be public or private?',
      type: 'list',
      choices: ['Public', 'Private'],
      default: 'Private'
    },
    ...!questionHasDecision(coreQuestionNames.VISIBILITY, decisions) ? includeLicenseQuestions(copyrightHolder) : [],
    {name: questionNames.GIT_REPO, type: 'confirm', default: true, message: 'Should a git repository be initialized?'}
  ], decisions);
}

export function promptForLanguageDetails(languages, decisions) {
  return prompt([{
    name: questionNames.PROJECT_TYPE,
    type: 'list',
    message: 'What type of project is this?',
    choices: [...Object.keys(languages), new Separator(), 'Other']
  }], decisions);
}

export async function promptForVcsHostDetails(hosts, visibility, decisions) {
  const answers = await prompt([{
    name: questionNames.REPO_HOST,
    type: 'list',
    message: 'Where will the repository be hosted?',
    choices: filterChoicesByVisibility(hosts, visibility)
  }], decisions);
  const host = hosts[answers[questionNames.REPO_HOST]];

  return {...answers, ...host && await host.prompt({decisions})};
}
