export default function (languagePlugins, chosenLanguage, options) {
  const plugin = languagePlugins[chosenLanguage];

  if (plugin) return plugin.scaffold(options);

  return undefined;
}
