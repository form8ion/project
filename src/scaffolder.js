import {resolve} from 'path';
import {copyFile} from 'mz/fs';
import chalk from 'chalk';
import {scaffold as scaffoldLanguage} from './language-scaffolder';
import scaffoldReadme from './readme';
import {initialize as initializeGit, scaffold as scaffoldGit} from './vcs/git';
import scaffoldLicense from './license';
import scaffoldVcsHost from './vcs/host';
import exec from '../third-party-wrappers/exec-as-promised';
import {promptForBaseDetails, promptForLanguageDetails} from './prompts/questions';
import {validate} from './options-validator';
import {questionNames} from './prompts/question-names';

export async function scaffold(options) {
  const projectRoot = process.cwd();
  const {languages = {}, overrides = {}, vcsHosts = {}} = validate(options);
  const {copyrightHolder} = overrides;

  const {
    [questionNames.PROJECT_NAME]: projectName,
    [questionNames.LICENSE]: chosenLicense,
    [questionNames.VISIBILITY]: visibility,
    [questionNames.DESCRIPTION]: description,
    [questionNames.GIT_REPO]: gitRepo,
    [questionNames.COPYRIGHT_YEAR]: copyrightYear,
    [questionNames.COPYRIGHT_HOLDER]: copyHolder
  } = await promptForBaseDetails(projectRoot, copyrightHolder);
  const copyright = {year: copyrightYear, holder: copyHolder};

  const vcs = await initializeGit(gitRepo, projectRoot, projectName, vcsHosts);

  const languageAnswers = await promptForLanguageDetails(languages);
  const projectType = languageAnswers[questionNames.PROJECT_TYPE];

  const [license, language] = await Promise.all([
    scaffoldLicense({projectRoot, license: chosenLicense, copyright, vcs}),
    scaffoldLanguage(
      languages,
      projectType,
      {projectRoot, projectName, vcs, visibility, license: chosenLicense || 'UNLICENSED', description}
    )
  ]);

  const vcsHostResults = await scaffoldVcsHost(vcsHosts, {
    ...vcs,
    projectRoot,
    projectType,
    description,
    visibility,
    homepage: language && language.projectDetails.homepage
  });

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
    gitRepo && scaffoldGit({projectRoot, ...language && {ignore: language.vcsIgnore}, origin: vcsHostResults}),
    copyFile(resolve(__dirname, '..', 'templates', 'editorconfig.txt'), `${projectRoot}/.editorconfig`)
  ]);

  console.log(chalk.blue('Verifying the generated project'));       // eslint-disable-line no-console
  if (language && language.verificationCommand) await exec(language.verificationCommand, {silent: false});
}
