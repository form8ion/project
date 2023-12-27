import writeIgnores from './scaffolder.js';

export default async function ({projectRoot, results: {vcsIgnore}}) {
  if (vcsIgnore) await writeIgnores({projectRoot, ...vcsIgnore});

  return {};
}
