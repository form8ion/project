import {prompt} from '@form8ion/overridable-prompts';

import {questionNames} from '../prompts/question-names.js';

export default async function promptForRepoCreation(decisions) {
  const {[questionNames.GIT_REPO]: gitRepoShouldBeCreated} = await prompt(
    [{
      name: questionNames.GIT_REPO,
      type: 'confirm',
      default: true,
      message: 'Should a git repository be initialized?'
    }],
    decisions
  );

  return gitRepoShouldBeCreated;
}
