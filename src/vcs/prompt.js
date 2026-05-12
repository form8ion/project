import {questionNames} from '../prompts/question-names.js';

export const GIT_REPOSITORY_PROMPT_ID = 'GIT_REPOSITORY';

const {GIT_REPO} = questionNames.GIT_REPOSITORY;

export default async function promptForRepoCreation({prompt}) {
  const {[GIT_REPO]: gitRepoShouldBeCreated} = await prompt({
    id: GIT_REPOSITORY_PROMPT_ID,
    questions: [{
      name: GIT_REPO,
      type: 'confirm',
      default: true,
      message: 'Should a git repository be initialized?'
    }]
  });

  return gitRepoShouldBeCreated;
}
