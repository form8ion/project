import {promises as fs} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import {info} from '@travi/cli-messages';

import stubbedFs from 'mock-fs';
import {Before, After, Given, When, setWorldConstructor} from '@cucumber/cucumber';
import any from '@travi/any';
import * as td from 'testdouble';

import {World} from '../support/world.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

setWorldConstructor(World);

let scaffold, lift, questionNames;
const projectPath = [__dirname, '..', '..', '..', '..'];
const projectTemplatePath = [...projectPath, 'templates'];
const stubbedNodeModules = stubbedFs.load(resolve(...projectPath, 'node_modules'));

Before({timeout: 20 * 1000}, async function () {
  this.git = await td.replaceEsm('simple-git');

  // eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
  ({scaffold, lift, questionNames} = await import('@form8ion/project'));

  stubbedFs({
    node_modules: stubbedNodeModules,
    templates: {'editorconfig.txt': await fs.readFile(resolve(...projectTemplatePath, 'editorconfig.txt'))}
  });
});

After(() => {
  stubbedFs.restore();
  td.reset();
});

Given('the project is {string}', async function (visibility) {
  this.visibility = visibility;
});

When(/^the project is scaffolded$/, async function () {
  const repoShouldBeCreated = this.getAnswerFor(questionNames.GIT_REPO);
  const visibility = this.visibility || any.fromList(['Public', 'Private']);
  const chosenUpdater = any.word();
  const chosenLanguage = this.getAnswerFor(questionNames.PROJECT_LANGUAGE) || 'Other';
  const vcsHost = this.getAnswerFor(questionNames.REPO_HOST);

  this.projectName = 'project-name';
  this.projectDescription = any.sentence();

  await scaffold({
    languages: {
      ...'Other' !== chosenLanguage && {
        [chosenLanguage]: ({projectName}) => {
          info(`Scaffolding ${chosenLanguage} language details for ${projectName}`);

          return this.languageScaffolderResults;
        }
      }
    },
    overrides: {},
    ...this.updaterScaffolderDetails && {dependencyUpdaters: {[chosenUpdater]: this.updaterScaffolderDetails}},
    ...vcsHost && {
      vcsHosts: {
        [vcsHost]: {scaffolder: ({name, owner}) => ({sshUrl: this.remoteOriginUrl}), prompt: () => undefined}
      }
    },
    decisions: {
      [questionNames.PROJECT_NAME]: this.projectName,
      [questionNames.DESCRIPTION]: this.projectDescription,
      [questionNames.VISIBILITY]: visibility,
      ...'Public' === visibility && {
        [questionNames.LICENSE]: 'MIT',
        [questionNames.COPYRIGHT_HOLDER]: any.word(),
        [questionNames.COPYRIGHT_YEAR]: 2000
      },
      ...'Private' === visibility && {[questionNames.UNLICENSED]: true},
      [questionNames.GIT_REPO]: repoShouldBeCreated ?? false,
      ...repoShouldBeCreated && {[questionNames.REPO_HOST]: vcsHost},
      [questionNames.PROJECT_LANGUAGE]: chosenLanguage,
      ...this.updaterScaffolderDetails && {[questionNames.DEPENDENCY_UPDATER]: chosenUpdater}
    }
  });
});

When('the project is lifted', async function () {
  await fs.writeFile(`${process.cwd()}/README.md`, this.existingReadmeContent || '');

  await lift({
    projectRoot: process.cwd(),
    vcs: {},
    results: {badges: this.badgesFromResults},
    enhancers: {
      [any.word()]: {
        test: () => true,
        lift: () => ({...this.enhancerBadges && {badges: this.enhancerBadges}})
      }
    }
  });
});
