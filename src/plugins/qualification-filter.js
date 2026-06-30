export default async function filterToQualifiedPlugins({plugins, projectRoot}) {
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
