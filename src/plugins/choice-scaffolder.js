import filterToQualifiedPlugins from './qualification-filter.js';

export default async function scaffoldChoiceFromOptions({plugins, options}, {choicePrompt}) {
  if (!Object.keys(plugins).length) return undefined;

  const {projectRoot} = options;
  const qualifiedPlugins = await filterToQualifiedPlugins({plugins, projectRoot});
  const chosen = await choicePrompt(qualifiedPlugins);
  const plugin = qualifiedPlugins[chosen];

  if (plugin) return plugin.scaffold(options);

  return {};
}
