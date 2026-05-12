import {questionNames} from '../prompts/question-names.js';
import {promptForDependencyUpdaterChoice} from './prompt.js';

const {DEPENDENCY_UPDATER} = questionNames.DEPENDENCY_UPDATER;

export default async function scaffoldDependencyUpdater(plugins, options, {prompt}) {
  if (!Object.keys(plugins).length) return undefined;

  const plugin = plugins[
    (await promptForDependencyUpdaterChoice(plugins, {prompt}))[DEPENDENCY_UPDATER]
  ];

  if (plugin) return plugin.scaffold(options);

  return undefined;
}
