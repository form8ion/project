export function scaffold(scaffolders, chosenLanguage, options) {
  const scaffolder = scaffolders[chosenLanguage];

  if (scaffolder) return scaffolder(options);

  return undefined;
}
