import {prompt} from '@form8ion/overridable-prompts';

import {questionNames} from '../../prompts/question-names.js';

export default async function (hosts, visibility, decisions) {
  const answers = await prompt([{
    name: questionNames.REPO_HOST,
    type: 'list',
    message: 'Where will the repository be hosted?',
    choices: hosts
  }], decisions);
  const host = hosts[answers[questionNames.REPO_HOST]];

  return {...answers, ...host};
}
