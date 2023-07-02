import {questionsForBaseDetails} from '@form8ion/core';
import {prompt} from '@form8ion/overridable-prompts';
import {filterChoicesByVisibility} from './conditionals';
import {questionNames} from './question-names';

export function promptForBaseDetails(projectRoot, copyrightHolder, decisions) {
  return prompt([
    ...questionsForBaseDetails(decisions, projectRoot, copyrightHolder),
    {name: questionNames.GIT_REPO, type: 'confirm', default: true, message: 'Should a git repository be initialized?'}
  ], decisions);
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
