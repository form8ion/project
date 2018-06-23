import {resolve} from 'path';
import {copyFile} from 'mz/fs';
import chalk from 'chalk';
import {Repository as gitRepository} from 'nodegit';
import {scaffold as scaffoldLanguage} from './language-scaffolder';
import scaffoldReadme from './readme';
import scaffoldGit from './vcs/git';
import scaffoldLicense from './license';
import scaffoldVcsHost from './vcs/host';
import exec from '../third-party-wrappers/exec-as-promised';
import {prompt} from './prompts/questions';
import {validate} from './options-validator';
import {questionNames} from './prompts/question-names';

export async function scaffold(options) {
  const projectRoot = process.cwd();
  const {languages = {}, overrides = {}} = validate(options);
  const answers = await prompt(projectRoot, languages, overrides);

  const projectType = answers[questionNames.PROJECT_TYPE];
  const projectName = answers[questionNames.PROJECT_NAME];
  const chosenLicense = answers[questionNames.LICENSE];
  const visibility = answers[questionNames.VISIBILITY];
  const description = answers[questionNames.DESCRIPTION];
  const gitRepo = answers[questionNames.GIT_REPO];
  const vcs = {host: answers[questionNames.REPO_HOST], owner: answers[questionNames.REPO_OWNER], name: projectName};

  if (gitRepo) gitRepository.init(projectRoot, 0);

  const [license, language] = await Promise.all([
    scaffoldLicense({
      projectRoot,
      license: chosenLicense,
      copyright: {year: answers[questionNames.COPYRIGHT_YEAR], holder: answers[questionNames.COPYRIGHT_HOLDER]},
      vcs
    }),
    scaffoldLanguage(languages, projectType, {
      projectRoot,
      projectName,
      vcs,
      visibility,
      license: chosenLicense || 'UNLICENSED',
      description
    })
  ]);

  await Promise.all([
    scaffoldReadme({
      projectName,
      projectRoot,
      description,
      ...language && {documentation: language.documentation},
      badges: {
        consumer: {...language && language.badges.consumer, ...license.badge && {license: license.badge}},
        status: {...language && language.badges.status},
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
    scaffoldVcsHost({
      host: answers[questionNames.REPO_HOST],
      projectRoot,
      projectType,
      description,
      homepage: language && language.projectDetails.homepage
    }),
    gitRepo && scaffoldGit({projectRoot, ...language && {ignore: language.vcsIgnore}}),
    copyFile(resolve(__dirname, '..', 'templates', 'editorconfig.txt'), `${projectRoot}/.editorconfig`)
  ]);

  console.log(chalk.blue('Verifying the generated project'));       // eslint-disable-line no-console
  if (language && language.verificationCommand) await exec(language.verificationCommand, {silent: false});
}
