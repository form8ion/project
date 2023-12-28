import writeIgnores from './writer.js';

export default async function ({projectRoot, results: {vcsIgnore}}) {
  if (vcsIgnore) await writeIgnores({projectRoot, ...vcsIgnore});

  return {};
}
