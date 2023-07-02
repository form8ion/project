export default function (scaffolders, chosenLanguage, options) {
  const scaffolder = scaffolders[chosenLanguage];

  if (scaffolder) return scaffolder(options);

  return undefined;
}
