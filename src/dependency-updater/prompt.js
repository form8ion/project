import {prompt, Separator} from '@form8ion/overridable-prompts';
import {questionNames} from '../prompts/question-names';

export async function promptForDependencyUpdaterChoice(updaters, decisions) {
  return prompt([{
    name: questionNames.DEPENDENCY_UPDATER,
    type: 'list',
    message: 'Which dependency-update service do you want to manage this project?',
    choices: [...Object.keys(updaters), new Separator(), 'Other']
  }], decisions);
}
