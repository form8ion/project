// #### Import
// remark-usage-ignore-next 3
import {promises as fs} from 'node:fs';
import {resolve} from 'node:path';
import stubbedFs from 'mock-fs';
import {ungroupObject} from '@form8ion/core';
import {lift, promptConstants, scaffold} from './lib/index.js';

// #### Execute

// remark-usage-ignore-next 4
stubbedFs({
  templates: {'editorconfig.ini': await fs.readFile(resolve('templates', 'editorconfig.ini'))},
  node_modules: stubbedFs.load('node_modules')
});

const plugins = {
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
};

await scaffold(
  {plugins},
  {
    prompt: async ({id}) => {
      const {questionNames, ids} = promptConstants;
      const {
        BASE_DETAILS: baseDetailsPromptId,
        GIT_REPOSITORY: gitRepositoryPromptId,
        PROJECT_LANGUAGE: projectLanguagePromptId
      } = ids;

      switch (id) {
        case baseDetailsPromptId: {
          const {
            PROJECT_NAME,
            LICENSE,
            VISIBILITY,
            DESCRIPTION,
            COPYRIGHT_HOLDER,
            COPYRIGHT_YEAR
          } = questionNames[baseDetailsPromptId];

          return {
            [PROJECT_NAME]: 'my-project',
            [LICENSE]: 'MIT',
            [VISIBILITY]: 'Public',
            [DESCRIPTION]: 'My project',
            [COPYRIGHT_HOLDER]: 'John Smith',
            [COPYRIGHT_YEAR]: '2022'
          };
        }
        case gitRepositoryPromptId: {
          const {GIT_REPO} = questionNames[gitRepositoryPromptId];

          return {[GIT_REPO]: false};
        }
        case projectLanguagePromptId: {
          const {PROJECT_LANGUAGE} = questionNames[projectLanguagePromptId];

          return {[PROJECT_LANGUAGE]: 'foo'};
        }
        default:
          throw new Error(`Unknown prompt with ID: ${id}`);
      }
    },
    logger: {
      info: () => undefined,
      success: () => undefined,
      warn: () => undefined,
      error: () => undefined
    }
  }
);

await lift({
  projectRoot: process.cwd(),
  results: {},
  enhancers: ungroupObject(plugins),
  vcs: {}
});
