import {promptForDependencyUpdaterChoice} from './prompts/questions';
import {questionNames} from './prompts/question-names';

export default async function (scaffolders, decisions, options) {
  const {[questionNames.DEPENDENCY_UPDATER]: chosenUpdater} = await promptForDependencyUpdaterChoice(
    scaffolders,
    decisions
  );
  const scaffolder = scaffolders[chosenUpdater];

  if (scaffolder) return scaffolder(options);

  return undefined;
}
