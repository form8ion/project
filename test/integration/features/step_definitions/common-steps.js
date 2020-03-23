import stubbedFs from 'mock-fs';
import {promises} from 'fs';
import {resolve} from 'path';
import {Before, After, When, setWorldConstructor} from 'cucumber';
import any from '@travi/any';
import {World} from '../support/world';
import {scaffold, questionNames} from '../../../../src';

setWorldConstructor(World);

Before(async () => {
  const projectTemplatePath = '../../../../templates';

  stubbedFs({
    templates: {
      'README.mustache': await promises.readFile(resolve(__dirname, projectTemplatePath, './README.mustache')),
      'editorconfig.txt': await promises.readFile(resolve(__dirname, projectTemplatePath, './editorconfig.txt'))
    }
  });
});

After(() => stubbedFs.restore());

When(/^the project is scaffolded$/, async function () {
  const repoShouldBeCreated = this.getAnswerFor(questionNames.GIT_REPO);
  const visibility = any.fromList(['Public', 'Private']);
  const chosenUpdater = any.word();

  this.projectName = 'project-name';
  this.projectDescription = any.sentence();

  await scaffold({
    languages: {},
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
      [questionNames.PROJECT_TYPE]: 'Other',
      ...this.updaterScaffolderDetails && {[questionNames.DEPENDENCY_UPDATER]: chosenUpdater}
    }
  });
});
