import {promises as fs} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import {info} from '@travi/cli-messages';

import stubbedFs from 'mock-fs';
import {Before, After, Given, When, setWorldConstructor} from '@cucumber/cucumber';
import any from '@travi/any';
import * as td from 'testdouble';
import {assert} from 'chai';

import {World} from '../support/world.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));          // eslint-disable-line no-underscore-dangle

setWorldConstructor(World);

let scaffold, lift, questionNames;
const projectPath = [__dirname, '..', '..', '..', '..'];
const projectTemplatePath = [...projectPath, 'templates'];
const stubbedNodeModules = stubbedFs.load(resolve(...projectPath, 'node_modules'));

Before({timeout: 20 * 1000}, async function () {
  this.projectRoot = process.cwd();
  this.projectName = 'project-name';
  this.git = await td.replaceEsm('simple-git');

  // eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
  ({scaffold, lift, questionNames} = await import('@form8ion/project'));

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
  this.visibility = visibility;
});

When(/^the project is scaffolded$/, async function () {
  const repoShouldBeCreated = this.getAnswerFor(questionNames.GIT_REPO);
  const visibility = this.visibility || any.fromList(['Public', 'Private']);
  const chosenUpdater = any.word();
  const chosenLanguage = this.getAnswerFor(questionNames.PROJECT_LANGUAGE) || 'Other';
  const vcsHost = this.getAnswerFor(questionNames.REPO_HOST);

  this.projectDescription = any.sentence();
  this.projectHomepage = any.url();

  this.languageLiftResults = {...any.simpleObject(), homepage: this.projectHomepage};

  await scaffold({
    plugins: {
      ...this.updatePlugin && {
        dependencyUpdaters: {
          [chosenUpdater]: this.updatePlugin
        }
      },
      languages: {
        ...'Other' !== chosenLanguage && {
          [chosenLanguage]: {
            scaffold: ({projectName, vcs}) => {
              info(`Scaffolding ${chosenLanguage} language details for ${projectName}`);

              if (repoShouldBeCreated && ((vcsHost && 'Other' !== vcsHost) || this.existingVcsHost)) {
                assert.equal(vcs.name, this.projectName);
                if ('GitHub' === this.existingVcsHost) {
                  assert.equal(vcs.host, 'github');
                }
              }

              return this.languageScaffolderResults;
            },
            test: ({projectRoot}) => {
              info(`Determining if project at ${projectRoot} uses the ${chosenLanguage} language`);

              return true;
            },
            lift: ({projectRoot}) => {
              info(`Applying the ${chosenLanguage} language lifter to the project at ${projectRoot}`);

              return this.languageLiftResults;
            }
          }
        }
      },
      ...vcsHost && 'Other' !== vcsHost && {
        vcsHosts: {
          [vcsHost]: {
            scaffold: ({projectName, owner}) => {
              this.hostedVcsDetails = {name: projectName, host: vcsHost};

              return ({
                vcs: {sshUrl: this.remoteOriginUrl, name: projectName, owner, host: vcsHost}
              });
            },
            test: ({projectRoot}) => {
              info(`Determining if project at ${projectRoot} uses the ${vcsHost} VCS host`);

              return true;
            },
            lift: ({results}) => {
              this.vcsHostProjectHomepage = results.homepage;

              return results;
            }
          }
        }
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
      ...this.updatePlugin && {[questionNames.DEPENDENCY_UPDATER]: chosenUpdater}
    }
  });
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
  });
});
