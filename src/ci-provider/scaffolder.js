import chooseCiProvider from './prompt.js';

async function filterToQualifiedPlugins(plugins, projectRoot) {
  return Object.fromEntries(
    (await Promise.all(
      Object.entries(plugins).map(async ([name, plugin]) => [
        name,
        plugin,
        plugin.qualify ? await plugin.qualify({projectRoot}) : true
      ])
    )).filter(([, , qualified]) => qualified).map(([name, plugin]) => [name, plugin])
  );
}

async function scaffoldChoiceFromOptions(plugins, options, promptToChooseFromOptions, {prompt}) {
  if (!Object.keys(plugins).length) return undefined;

  const {projectRoot} = options;
  const qualifiedPlugins = await filterToQualifiedPlugins(plugins, projectRoot);
  const chosen = await promptToChooseFromOptions(qualifiedPlugins, {prompt});
  const plugin = qualifiedPlugins[chosen];

  if (plugin) return plugin.scaffold(options);

  return {};
}

export default async function scaffoldCiProvider(plugins, options, {prompt}) {
  return scaffoldChoiceFromOptions(plugins, options, chooseCiProvider, {prompt});
}
