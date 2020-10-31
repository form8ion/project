import stubbedFs from 'mock-fs';
import {promises} from 'fs';
import {resolve} from 'path';
import {info} from '@travi/cli-messages';
import {Before, After, Given, When, setWorldConstructor} from 'cucumber';
import any from '@travi/any';
import {World} from '../support/world';

setWorldConstructor(World);

let scaffold, questionNames;
const projectPath = [__dirname, '..', '..', '..', '..'];
const projectTemplatePath = [...projectPath, 'templates'];
const stubbedNodeModules = stubbedFs.load(resolve(...projectPath, 'node_modules'));

Before(async () => {
  ({scaffold, questionNames} = require('../../../../src'));

  stubbedFs({
    node_modules: stubbedNodeModules,
    templates: {
      'README.mustache': await promises.readFile(resolve(...projectTemplatePath, './README.mustache')),
      'editorconfig.txt': await promises.readFile(resolve(...projectTemplatePath, './editorconfig.txt'))
    }
  });
});

After(() => stubbedFs.restore());

Given('the project is {string}', async function (visibility) {
  this.visibility = visibility;
});

When(/^the project is scaffolded$/, async function () {
  const repoShouldBeCreated = this.getAnswerFor(questionNames.GIT_REPO);
  const visibility = this.visibility || any.fromList(['Public', 'Private']);
  const chosenUpdater = any.word();
  const chosenLanguage = this.getAnswerFor(questionNames.PROJECT_TYPE) || 'Other';

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
      ...repoShouldBeCreated && {[questionNames.REPO_HOST]: 'Other'},
      [questionNames.PROJECT_TYPE]: chosenLanguage,
      ...this.updaterScaffolderDetails && {[questionNames.DEPENDENCY_UPDATER]: chosenUpdater}
    }
  });
});
