// #### Import
// remark-usage-ignore-next 3
import {promises as fs} from 'fs';
import {resolve} from 'path';
import stubbedFs from 'mock-fs';
import {lift, questionNames, scaffold} from './lib/index.js';

// #### Execute

// remark-usage-ignore-next 2
(async () => {
  stubbedFs({templates: {'editorconfig.txt': await fs.readFile(resolve(__dirname, 'templates', 'editorconfig.txt'))}});

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
    languages: {
      foo: options => options
    }
  });

  await lift({
    projectRoot: process.cwd(),
    results: {},
    enhancers: {foo: {test: () => true, lift: () => ({})}},
    vcs: {}
  });
// remark-usage-ignore-next
})();
