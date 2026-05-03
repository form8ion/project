import {questionNames} from '../../prompts/question-names.js';

export const REPOSITORY_HOST_PROMPT_ID = 'REPOSITORY_HOST';

const {REPO_HOST} = questionNames.REPOSITORY_HOST;

export default async function promptForVcsHostChoice(hosts, {prompt}) {
  const answers = await prompt({
    id: REPOSITORY_HOST_PROMPT_ID,
    questions: [{
      name: REPO_HOST,
      type: 'list',
      message: 'Where will the repository be hosted?',
      choices: Object.keys(hosts)
    }]
  });
  const host = hosts[answers[REPO_HOST]];

  return {...answers, ...host};
}
