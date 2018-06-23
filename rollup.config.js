/* eslint import/no-extraneous-dependencies: ['error', {'devDependencies': true}] */

export default {
  input: 'src/index.js',
  external: [
    'mz/fs',
    'inquirer',
    'shelljs',
    'path',
    'chalk',
    '@travi/javascript-scaffolder',
    'mustache',
    'nodegit',
    'spdx-license-list/full',
    'spdx-license-list/simple',
    'util',
    'write-yaml',
    'git-config',
    'joi',
    'hoek'
  ],
  output: [
    {file: 'lib/index.cjs.js', format: 'cjs', sourcemap: true},
    {file: 'lib/index.es.js', format: 'es', sourcemap: true}
  ]
};
