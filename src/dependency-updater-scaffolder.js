export default function (scaffolders, chosenUpdater, options) {
  const scaffolder = scaffolders[chosenUpdater];

  if (scaffolder) return scaffolder(options);

  return undefined;
}
