import {questionNames} from '../prompts/question-names.js';

export const GIT_REPOSITORY_PROMPT_ID = 'GIT_REPOSITORY';

export default async function promptForRepoCreation({prompt}) {
  const {[questionNames.GIT_REPO]: gitRepoShouldBeCreated} = await prompt({
    id: GIT_REPOSITORY_PROMPT_ID,
    questions: [{
      name: questionNames.GIT_REPO,
      type: 'confirm',
      default: true,
      message: 'Should a git repository be initialized?'
    }]
  });

  return gitRepoShouldBeCreated;
}
