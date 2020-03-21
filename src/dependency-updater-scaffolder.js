import {promptForDependencyUpdaterChoice} from './prompts/questions';
import {questionNames} from './prompts/question-names';

export default async function (scaffolders, decisions, options) {
  if (!Object.keys(scaffolders).length) return undefined;

  const scaffolder = scaffolders[
    (await promptForDependencyUpdaterChoice(scaffolders, decisions))[questionNames.DEPENDENCY_UPDATER]
  ];

  if (scaffolder) return scaffolder(options);

  return undefined;
}
