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

export function filterChoicesByVisibility(choices, visibility) {
  return [
    ...Object.entries(choices)
      .filter(([, choice]) => choice[visibility.toLowerCase()])
      .reduce((acc, [name]) => ([...acc, name]), []),
    new Separator(),
    'Other'
  ];
}
