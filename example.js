// #### Import
// remark-usage-ignore-next 3
import {promises as fs} from 'node:fs';
import {resolve} from 'path';
import stubbedFs from 'mock-fs';
import {lift, questionNames, scaffold} from './lib/index.js';

// #### Execute

// remark-usage-ignore-next 4
stubbedFs({
  templates: {'editorconfig.ini': await fs.readFile(resolve('templates', 'editorconfig.ini'))},
  node_modules: stubbedFs.load('node_modules')
});

await scaffold({
  decisions: {
    [questionNames.PROJECT_NAME]: 'my-project',
    [questionNames.LICENSE]: 'MIT',
    [questionNames.VISIBILITY]: 'Public',
    [questionNames.DESCRIPTION]: 'My project',
    [questionNames.GIT_REPO]: false,
    [questionNames.COPYRIGHT_HOLDER]: 'John Smith',
    [questionNames.COPYRIGHT_YEAR]: '2022',
    [questionNames.PROJECT_LANGUAGE]: 'foo'
  },
  plugins: {
    dependencyUpdaters: {
      bar: {scaffold: options => options}
    },
    languages: {
      foo: {scaffold: options => options}
    },
    vcsHosts: {
      baz: {
        scaffold: options => options,
        prompt: () => ({repoOwner: 'form8ion'})
      }
    }
  }
});

await lift({
  projectRoot: process.cwd(),
  results: {},
  enhancers: {foo: {test: () => true, lift: () => ({})}},
  vcs: {}
});
