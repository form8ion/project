/* eslint import/no-extraneous-dependencies: ['error', {'devDependencies': true}] */
import autoExternal from 'rollup-plugin-auto-external';

export default {
  input: 'src/index.js',
  plugins: [autoExternal()],
  external: [
    'spdx-license-list/full',
    'spdx-license-list/simple'
  ],
  output: [
    {file: 'lib/index.esm.js', format: 'es', sourcemap: true}
  ]
};
