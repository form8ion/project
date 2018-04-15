import {resolve} from 'path';
import {copyFile} from 'mz/fs';
import chalk from 'chalk';
import scaffoldReadme from './readme';
import scaffoldGit from './vcs/git';
import scaffoldLicense from './license';
import scaffoldVcsHost from './vcs/host';
import scaffoldJavaScriptProject from '../../javascript/src/scaffolder';
import scaffoldTravis from './ci/travis';
import exec from '../../../third-party-wrappers/exec-as-promised';
import {prompt, questionNames} from './prompts';

export default async function () {
  const projectRoot = process.cwd();
  const answers = await prompt(projectRoot);

  const projectType = answers[questionNames.PROJECT_TYPE];
  function isJavaScriptProject() {
    return 'JavaScript' === projectType;
  }

  const projectName = answers[questionNames.PROJECT_NAME];
  const chosenLicense = answers[questionNames.LICENSE];
  const visibility = answers[questionNames.VISIBILITY];
  const vcs = await scaffoldVcsHost({host: answers[questionNames.REPO_HOST], projectName, projectRoot, projectType});
  const [license, ci, language] = await Promise.all([
    scaffoldLicense({
      projectRoot,
      license: chosenLicense,
      copyright: {year: answers[questionNames.COPYRIGHT_YEAR], holder: answers[questionNames.COPYRIGHT_HOLDER]},
      vcs
    }),
    ('Travis' === answers[questionNames.CI])
      ? scaffoldTravis({projectRoot, projectType, vcs, visibility})
      : Promise.resolve({}),
    isJavaScriptProject() ? scaffoldJavaScriptProject({
      projectRoot,
      projectName,
      vcs,
      visibility,
      license: chosenLicense,
      ci: answers[questionNames.CI]
    }) : undefined
  ]);

  await Promise.all([
    scaffoldReadme({
      projectName,
      projectRoot,
      description: answers[questionNames.DESCRIPTION],
      license: chosenLicense,
      badges: {
        consumer: {...language && language.badges.consumer, ...license.badge && {license: license.badge}},
        status: {...ci.badge && {ci: ci.badge}},
        contribution: {...language && language.badges.contribution}
      }
    }),
    answers[questionNames.GIT_REPO]
      ? scaffoldGit({projectRoot, ...language && {ignore: language.vcsIgnore}})
      : undefined,
    copyFile(resolve(__dirname, '..', 'templates', 'editorconfig.txt'), `${projectRoot}/.editorconfig`)
  ]);

  console.log(chalk.blue('Verifying the generated project'));       // eslint-disable-line no-console
  if (language && language.verificationCommand) await exec(language.verificationCommand, {silent: false});
}
