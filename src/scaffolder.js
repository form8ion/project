import {resolve} from 'path';
import {copyFile} from 'mz/fs';
import {info} from '@travi/cli-messages';
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
  const {languages = {}, overrides = {}, vcsHosts = {}, decisions} = validate(options);
  const {copyrightHolder} = overrides;

  const {
    [questionNames.PROJECT_NAME]: projectName,
    [questionNames.LICENSE]: chosenLicense,
    [questionNames.VISIBILITY]: visibility,
    [questionNames.DESCRIPTION]: description,
    [questionNames.GIT_REPO]: gitRepo,
    [questionNames.COPYRIGHT_YEAR]: copyrightYear,
    [questionNames.COPYRIGHT_HOLDER]: copyHolder
  } = await promptForBaseDetails(projectRoot, copyrightHolder, decisions);
  const copyright = {year: copyrightYear, holder: copyHolder};

  const vcs = await initializeGit(gitRepo, projectRoot, projectName, vcsHosts, visibility, decisions);

  const languageAnswers = await promptForLanguageDetails(languages, decisions);
  const projectType = languageAnswers[questionNames.PROJECT_TYPE];

  const [license, language] = await Promise.all([
    scaffoldLicense({projectRoot, license: chosenLicense, copyright, vcs}),
    scaffoldLanguage(
      languages,
      projectType,
      {projectRoot, projectName, vcs, visibility, license: chosenLicense || 'UNLICENSED', description}
    )
  ]);

  const vcsHostResults = vcs && await scaffoldVcsHost(vcsHosts, {
    ...vcs,
    projectRoot,
    projectType,
    description,
    visibility,
    homepage: language && language.projectDetails && language.projectDetails.homepage
  });

  await Promise.all([
    scaffoldReadme({
      projectName,
      projectRoot,
      description,
      ...language && {documentation: language.documentation},
      badges: {
        consumer: {
          ...language && language.badges && language.badges.consumer,
          ...license.badges && {license: license.badges.consumer}
        },
        status: {...language && language.badges && language.badges.status},
        contribution: {
          ...language && language.badges && language.badges.contribution,
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

  info('Verifying the generated project');
  if (language && language.verificationCommand) await exec(language.verificationCommand, {silent: false});
}
