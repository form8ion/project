import stubbedFs from 'mock-fs';
import {promises as fs} from 'fs';
import {resolve} from 'path';
import {info} from '@travi/cli-messages';
import {Before, After, Given, When, setWorldConstructor} from '@cucumber/cucumber';
import any from '@travi/any';
import td from 'testdouble';
import {World} from '../support/world';

setWorldConstructor(World);

let scaffold, lift, questionNames;
const projectPath = [__dirname, '..', '..', '..', '..'];
const projectTemplatePath = [...projectPath, 'templates'];
const packagePreviewDirectory = '../__package_previews__/project';
const stubbedNodeModules = stubbedFs.load(resolve(...projectPath, 'node_modules'));

Before(async function () {
  this.nodegit = td.replace('nodegit');

  // eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
  ({scaffold, lift, questionNames} = require('@form8ion/project'));

  stubbedFs({
    node_modules: stubbedNodeModules,
    [packagePreviewDirectory]: {
      '@form8ion': {
        project: {
          templates: {
            'README.mustache': await fs.readFile(resolve(...projectTemplatePath, 'README.mustache')),
            'editorconfig.txt': await fs.readFile(resolve(...projectTemplatePath, 'editorconfig.txt'))
          },
          node_modules: {
            ...stubbedNodeModules,
            '.pnpm': {
              node_modules: stubbedNodeModules,
              'ansi-styles@4.3.0': {
                node_modules: stubbedNodeModules
              }
            }
          }
        }
      }
    }
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
      ...repoShouldBeCreated && {[questionNames.REPO_HOST]: this.getAnswerFor(questionNames.REPO_HOST)},
      [questionNames.PROJECT_LANGUAGE]: chosenLanguage,
      ...this.updaterScaffolderDetails && {[questionNames.DEPENDENCY_UPDATER]: chosenUpdater}
    }
  });
});

When('the project is lifted', async function () {
  await fs.writeFile(`${process.cwd()}/README.md`, this.existingReadmeContent || '');

  await lift({projectRoot: process.cwd(), results: {badges: this.badgesFromResults}});
});
