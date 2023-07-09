import autoExternal from 'rollup-plugin-auto-external';
import nodeResolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  plugins: [
    autoExternal(),
    nodeResolve({mainFields: ['module']})
  ],
  external: ['spdx-license-list/full.js'],
  output: [
    {file: 'lib/index.js', format: 'esm', sourcemap: true}
  ]
};
