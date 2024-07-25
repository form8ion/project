import {questionNames} from '../prompts/question-names.js';
import {promptForDependencyUpdaterChoice} from './prompt.js';

export default async function (plugins, decisions, options) {
  if (!Object.keys(plugins).length) return undefined;

  const plugin = plugins[
    (await promptForDependencyUpdaterChoice(plugins, decisions))[questionNames.DEPENDENCY_UPDATER]
  ];

  if (plugin) return plugin.scaffold(options);

  return undefined;
}
