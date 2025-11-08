import {questionNames} from '../prompts/question-names.js';

export const DEPENDENCY_UPDATER_PROMPT_ID = 'DEPENDENCY_UPDATER';

export async function promptForDependencyUpdaterChoice(updaters, {prompt}) {
  return prompt({
    id: DEPENDENCY_UPDATER_PROMPT_ID,
    questions: [{
      name: questionNames.DEPENDENCY_UPDATER,
      type: 'list',
      message: 'Which dependency-update service do you want to manage this project?',
      choices: [...Object.keys(updaters), 'Other']
    }]
  });
}
