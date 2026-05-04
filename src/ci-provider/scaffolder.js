import {questionNames} from '../prompts/question-names.js';
import promptForCiProvider from './prompt.js';

const {CI_PROVIDER} = questionNames.CI_PROVIDER;

export default async function scaffoldCiProvider(plugins, options, {prompt}) {
  if (!Object.keys(plugins).length) return undefined;

  const {projectRoot} = options;

  const qualifiedPlugins = Object.fromEntries(
    (await Promise.all(
      Object.entries(plugins).map(async ([name, plugin]) => [name, plugin, await plugin.qualify({projectRoot})])
    )).filter(([, , qualified]) => qualified).map(([name, plugin]) => [name, plugin])
  );

  const chosen = (await promptForCiProvider(qualifiedPlugins, {prompt}))[CI_PROVIDER];
  const plugin = qualifiedPlugins[chosen];

  if (plugin) return plugin.scaffold(options);

  return {};
}
