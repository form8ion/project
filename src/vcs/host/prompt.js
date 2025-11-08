import {questionNames} from '../../prompts/question-names.js';

export const REPOSITORY_HOST_PROMPT_ID = 'REPOSITORY_HOST';

export default async function promptForVcsHostChoice(hosts, {prompt}) {
  const answers = await prompt({
    id: REPOSITORY_HOST_PROMPT_ID,
    questions: [{
      name: questionNames.REPO_HOST,
      type: 'list',
      message: 'Where will the repository be hosted?',
      choices: Object.keys(hosts)
    }]
  });
  const host = hosts[answers[questionNames.REPO_HOST]];

  return {...answers, ...host};
}
