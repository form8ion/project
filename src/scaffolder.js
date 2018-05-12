import {resolve} from 'path';
import {copyFile} from 'mz/fs';
import chalk from 'chalk';
import {scaffold as scaffoldLanguage} from './language-scaffolder';
import scaffoldReadme from './readme';
import scaffoldGit from './vcs/git';
import scaffoldLicense from './license';
import scaffoldVcsHost from './vcs/host';
import scaffoldTravis from './ci/travis';
import exec from '../third-party-wrappers/exec-as-promised';
import {prompt, questionNames} from './prompts';

export async function scaffold({languages}) {
  const projectRoot = process.cwd();
  const answers = await prompt(projectRoot, languages);

  const projectType = answers[questionNames.PROJECT_TYPE];
  const projectName = answers[questionNames.PROJECT_NAME];
  const chosenLicense = answers[questionNames.LICENSE];
  const visibility = answers[questionNames.VISIBILITY];
  const description = answers[questionNames.DESCRIPTION];
  const ciService = answers[questionNames.CI];
  const vcs = await scaffoldVcsHost({
    host: answers[questionNames.REPO_HOST],
    projectName,
    projectRoot,
    projectType,
    description
  });
  const [license, ci, language] = await Promise.all([
    scaffoldLicense({
      projectRoot,
      license: chosenLicense,
      copyright: {year: answers[questionNames.COPYRIGHT_YEAR], holder: answers[questionNames.COPYRIGHT_HOLDER]},
      vcs
    }),
    ('Travis' === ciService)
      ? scaffoldTravis({projectRoot, projectType, vcs, visibility})
      : Promise.resolve({}),
    scaffoldLanguage(languages, projectType, {
      projectRoot,
      projectName,
      vcs,
      visibility,
      license: chosenLicense,
      ci: ciService,
      description,
      eslintConfigPrefix: '@travi/travi'
    })
  ]);

  await Promise.all([
    scaffoldReadme({
      projectName,
      projectRoot,
      description,
      license: chosenLicense,
      badges: {
        consumer: {...language && language.badges.consumer, ...license.badge && {license: license.badge}},
        status: {...ci.badge && {ci: ci.badge}},
        contribution: {
          ...language && language.badges.contribution,
          ...'Public' === visibility && {
            PRs: {
              text: 'PRs Welcome',
              link: 'http://makeapullrequest.com',
              img: 'https://img.shields.io/badge/PRs-welcome-brightgreen.svg'
            }
          }
        }
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
