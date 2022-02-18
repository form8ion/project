// #### Import
// remark-usage-ignore-next
import stubbedFs from 'mock-fs';
import {lift, scaffold, questionNames} from './lib/index.cjs';

// remark-usage-ignore-next 2
stubbedFs();

// #### Execute

(async () => {
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

  await lift({projectRoot: process.cwd(), results: {}});
})();
