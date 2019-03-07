import {Separator} from 'inquirer';
import {questionNames} from './question-names';

export function unlicensedConfirmationShouldBePresented(answers) {
  return 'Private' === answers[questionNames.VISIBILITY];
}

export function licenseChoicesShouldBePresented(answers) {
  return 'Public' === answers[questionNames.VISIBILITY] || !answers[questionNames.UNLICENSED];
}

export function copyrightInformationShouldBeRequested(answers) {
  return !!answers[questionNames.LICENSE];
}

export function filterChoicesByVisibility(choices) {
  return answers => ([
    ...Object.entries(choices)
      .filter(([, choice]) => choice[answers[questionNames.VISIBILITY].toLowerCase()])
      .reduce((acc, [name]) => ([...acc, name]), []),
    new Separator(),
    'Other'
  ]);
}
