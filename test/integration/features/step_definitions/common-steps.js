import debugFactory from 'debug';

import {promises as fs} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import stubbedFs from 'mock-fs';
import {Before, After, Given, When, setWorldConstructor} from '@cucumber/cucumber';
import any from '@travi/any';
import * as td from 'testdouble';
import {assert} from 'chai';

import {deriveHostMarkerDirectory} from './vcs/vcs-host-steps.js';
import {World} from '../support/world.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));          // eslint-disable-line no-underscore-dangle
const debug = debugFactory('test:common-steps');

setWorldConstructor(World);

let scaffold, lift, questionNames;
const projectPath = [__dirname, '..', '..', '..', '..'];
const projectTemplatePath = [...projectPath, 'templates'];
const stubbedNodeModules = stubbedFs.load(resolve(...projectPath, 'node_modules'));
const logger = {
  info: () => undefined,
  success: () => undefined,
  warn: () => undefined,
  error: () => undefined
};
export const visibilityAbbreviations = {
  'Open Source': 'OSS',
  'Inner Source': 'ISS',
  'Closed Source': 'CS'
};

Before({timeout: 20 * 1000}, async function () {
  this.projectRoot = process.cwd();
  this.projectName = 'project-name';
  this.git = await td.replaceEsm('simple-git');

  // eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
  ({scaffold, lift, promptConstants: {questionNames}} = await import('@form8ion/project'));

  stubbedFs({
    node_modules: stubbedNodeModules,
    templates: {'editorconfig.ini': await fs.readFile(resolve(...projectTemplatePath, 'editorconfig.ini'))}
  });
});

After(() => {
  stubbedFs.restore();
  td.reset();
});

Given('the project is {string}', async function (visibility) {
  this.visibility = visibilityAbbreviations[visibility];
});

When(/^the project is scaffolded$/, async function () {
  const repoShouldBeCreated = this.getAnswerFor(questionNames.GIT_REPOSITORY.GIT_REPO);
  const visibility = this.visibility || any.fromList(Object.values(visibilityAbbreviations));
  const chosenUpdater = any.word();
  const chosenLanguage = this.getAnswerFor(questionNames.PROJECT_LANGUAGE.PROJECT_LANGUAGE) || 'Other';
  const vcsHost = this.getAnswerFor(questionNames.REPOSITORY_HOST.REPO_HOST);
  const chosenCiProvider = this.getAnswerFor(questionNames.CI_PROVIDER.CI_PROVIDER) || 'Other';
  const chosenCoverageService = this.getAnswerFor(questionNames.COVERAGE_SERVICE.COVERAGE_SERVICE) || 'Other';

  this.projectDescription = any.sentence();
  this.projectHomepage = any.url();

  this.languageLiftResults = {...any.simpleObject(), homepage: this.projectHomepage};

  await scaffold(
    {
      plugins: {
        ...this.updatePlugin && {
          dependencyUpdaters: {
            [chosenUpdater]: this.updatePlugin
          }
        },
        ...this.ciProviderPlugins && {
          ciProviders: this.ciProviderPlugins
        },
        ...this.coverageServicePlugins && {
          coverageServices: this.coverageServicePlugins
        },
        languages: {
          ...'Other' !== chosenLanguage && {
            [chosenLanguage]: {
              scaffold: ({projectName, vcs}) => {
                debug(`Scaffolding ${chosenLanguage} language details for ${projectName}`);

                if (repoShouldBeCreated && ((vcsHost && 'Other' !== vcsHost) || this.existingVcsHost)) {
                  assert.equal(vcs.name, this.projectName);
                  if ('GitHub' === this.existingVcsHost) {
                    assert.equal(vcs.host, 'github.com');
                  }
                }

                return this.languageScaffolderResults;
              },
              test: ({projectRoot}) => {
                debug(`Determining if project at ${projectRoot} uses the ${chosenLanguage} language`);

                return true;
              },
              lift: ({projectRoot}) => {
                debug(`Applying the ${chosenLanguage} language lifter to the project at ${projectRoot}`);

                return this.languageLiftResults;
              }
            }
          }
        },
        ...vcsHost && 'Other' !== vcsHost && {
          vcsHosts: {
            [vcsHost]: {
              scaffold: async ({projectName, owner, projectRoot}) => {
                const markerDirectory = deriveHostMarkerDirectory(vcsHost);

                if (markerDirectory) {
                  this.vcsHostMarkerDirectory = markerDirectory;
                  await fs.mkdir(`${projectRoot}/${markerDirectory}`, {recursive: true});
                }

                this.hostedVcsDetails = {name: projectName, host: vcsHost};

                return ({
                  vcs: {sshUrl: this.remoteOriginUrl, name: projectName, owner, host: vcsHost}
                });
              },
              test: ({projectRoot}) => {
                debug(`Determining if project at ${projectRoot} uses the ${vcsHost} VCS host`);

                return true;
              },
              lift: ({results}) => {
                this.vcsHostProjectHomepage = results.homepage;

                return results;
              }
            }
          }
        }
      }
    },
    {
      prompt: async ({id, questions}) => {
        // eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
        const {promptConstants: {ids}} = await import('@form8ion/project');
        const {
          BASE_DETAILS: baseDetailsPromptId,
          GIT_REPOSITORY: gitRepositoryPromptId,
          REPOSITORY_HOST: repositoryHostPromptId,
          PROJECT_LANGUAGE: projectLanguagePromptId,
          DEPENDENCY_UPDATER: dependencyUpdaterPromptId,
          CI_PROVIDER: ciProviderPromptId,
          COVERAGE_SERVICE: coverageServicePromptId
        } = ids;

        this.promptQuestionsById = {
          ...this.promptQuestionsById,
          [id]: questions
        };

        switch (id) {
          case baseDetailsPromptId: {
            const {PROJECT_NAME, DESCRIPTION, VISIBILITY} = questionNames[baseDetailsPromptId];

            if (!questions.find(question => VISIBILITY === question.name).validate(visibility)) {
              throw new Error(`Visibility of '${visibility}' provided in test is not valid`);
            }

            return {
              [PROJECT_NAME]: this.projectName,
              [DESCRIPTION]: this.projectDescription,
              [VISIBILITY]: visibility
            };
          }
          case gitRepositoryPromptId: {
            const {GIT_REPO} = questionNames[gitRepositoryPromptId];

            return {
              [GIT_REPO]: repoShouldBeCreated ?? false
            };
          }
          case repositoryHostPromptId: {
            const {REPO_HOST} = questionNames[repositoryHostPromptId];

            return {
              [REPO_HOST]: vcsHost
            };
          }
          case projectLanguagePromptId: {
            const {PROJECT_LANGUAGE} = questionNames[projectLanguagePromptId];

            return {
              [PROJECT_LANGUAGE]: chosenLanguage
            };
          }
          case dependencyUpdaterPromptId: {
            const {DEPENDENCY_UPDATER} = questionNames[dependencyUpdaterPromptId];

            return {
              [DEPENDENCY_UPDATER]: chosenUpdater
            };
          }
          case ciProviderPromptId: {
            const {CI_PROVIDER} = questionNames[ciProviderPromptId];

            return {
              [CI_PROVIDER]: chosenCiProvider
            };
          }
          case coverageServicePromptId: {
            const {COVERAGE_SERVICE} = questionNames[coverageServicePromptId];

            return {
              [COVERAGE_SERVICE]: chosenCoverageService
            };
          }
          default:
            throw new Error(`Unknown prompt with ID: ${id}`);
        }
      },
      logger
    }
  );
});

When('the project is lifted', async function () {
  this.existingVcsIgnoredFiles = any.listOf(any.word);
  this.existingVcsIgnoredDirectories = any.listOf(any.word);

  await Promise.all([
    fs.writeFile(`${process.cwd()}/README.md`, this.existingReadmeContent || ''),
    fs.writeFile(
      `${process.cwd()}/.gitignore`,
      `${this.existingVcsIgnoredDirectories.join('\n')}\n\n${this.existingVcsIgnoredFiles.join('\n')}`
    )
  ]);

  await lift({
    projectRoot: this.projectRoot,
    vcs: {
      owner: this.vcsOwner,
      name: this.vcsName,
      ...this.repoHost && {host: this.repoHost.toLowerCase()}
    },
    results: {
      badges: this.badgesFromResults,
      ...(this.vcsIgnoreDirectories || this.vcsIgnoreFiles) && {
        vcsIgnore: {
          ...this.vcsIgnoreDirectories && {directories: this.vcsIgnoreDirectories},
          ...this.vcsIgnoreFiles && {files: this.vcsIgnoreFiles}
        }
      }
    },
    enhancers: {
      [any.word()]: {
        test: () => true,
        lift: () => ({...this.enhancerBadges && {badges: this.enhancerBadges}})
      }
    }
  }, {logger});
});
