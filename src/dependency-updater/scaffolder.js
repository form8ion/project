import {questionNames} from '../prompts/question-names.js';
import {promptForDependencyUpdaterChoice} from './prompt.js';

export default async function (plugins, options, {prompt}) {
  if (!Object.keys(plugins).length) return undefined;

  const plugin = plugins[
    (await promptForDependencyUpdaterChoice(plugins, {prompt}))[questionNames.DEPENDENCY_UPDATER]
  ];

  if (plugin) return plugin.scaffold(options);

  return undefined;
}
