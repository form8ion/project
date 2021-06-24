import {resolve} from 'path';
import {promises} from 'fs';
import deepmerge from 'deepmerge';
import {questionNames as coreQuestionNames} from '@form8ion/core';
import {reportResults} from '@form8ion/results-reporter';
import {info} from '@travi/cli-messages';
import execa from '../thirdparty-wrappers/execa.js';
import {scaffold as scaffoldLanguage} from './language-scaffolder.js';
import scaffoldReadme from './readme.js';
import {initialize as initializeGit, scaffold as scaffoldGit} from './vcs/git.js';
import scaffoldLicense from './license.js';
import scaffoldVcsHost from './vcs/host.js';
import scaffoldDependencyUpdater from './dependency-updater/scaffolder.js';
import {promptForBaseDetails, promptForLanguageDetails} from './prompts/questions.js';
import {validate} from './options-validator.js';
import {questionNames} from './prompts/question-names.js';

export async function scaffold(options) {
  const projectRoot = process.cwd();
  const {languages = {}, overrides = {}, vcsHosts = {}, decisions, dependencyUpdaters} = validate(options);
  const {copyrightHolder} = overrides;

  const {
    [coreQuestionNames.PROJECT_NAME]: projectName,
    [coreQuestionNames.LICENSE]: chosenLicense,
    [coreQuestionNames.VISIBILITY]: visibility,
    [coreQuestionNames.DESCRIPTION]: description,
    [questionNames.GIT_REPO]: gitRepo,
    [coreQuestionNames.COPYRIGHT_YEAR]: copyrightYear,
    [coreQuestionNames.COPYRIGHT_HOLDER]: copyHolder
  } = await promptForBaseDetails(projectRoot, copyrightHolder, decisions);
  const copyright = {year: copyrightYear, holder: copyHolder};

  const vcs = await initializeGit(gitRepo, projectRoot, projectName, vcsHosts, visibility, decisions);

  const {[questionNames.PROJECT_LANGUAGE]: projectLanguage} = await promptForLanguageDetails(languages, decisions);

  const [license, language] = await Promise.all([
    scaffoldLicense({projectRoot, license: chosenLicense, copyright, vcs}),
    scaffoldLanguage(
      languages,
      projectLanguage,
      {projectRoot, projectName, vcs, visibility, license: chosenLicense || 'UNLICENSED', description}
    )
  ]);

  const dependencyUpdaterResults = vcs && await scaffoldDependencyUpdater(
    dependencyUpdaters,
    decisions,
    {projectRoot, vcs}
  );

  const contributors = [license, language, dependencyUpdaterResults].filter(Boolean);
  const contributedTasks = contributors
    .map(contributor => contributor.nextSteps)
    .filter(Boolean)
    .reduce((acc, contributedNextSteps) => ([...acc, ...contributedNextSteps]), []);

  const vcsHostResults = vcs && await scaffoldVcsHost(vcsHosts, {
    ...vcs,
    projectRoot,
    projectType: projectLanguage,
    description,
    visibility,
    ...language && {
      homepage: language.projectDetails && language.projectDetails.homepage,
      tags: language.tags
    },
    nextSteps: contributedTasks
  });

  await Promise.all([
    scaffoldReadme({
      projectName,
      projectRoot,
      description,
      ...language && {documentation: language.documentation},
      badges: deepmerge.all([
        {
          contribution: {
            ...'Public' === visibility && {
              PRs: {
                text: 'PRs Welcome',
                link: 'http://makeapullrequest.com',
                img: 'https://img.shields.io/badge/PRs-welcome-brightgreen.svg'
              }
            }
          },
          status: {},
          consumer: {}
        },
        ...contributors.map(contributor => contributor.badges).filter(Boolean)
      ])
    }),
    promises.copyFile(resolve(__dirname, '..', 'templates', 'editorconfig.txt'), `${projectRoot}/.editorconfig`)
  ]);

  const gitResults = gitRepo && await scaffoldGit({
    projectRoot,
    ...language && {ignore: language.vcsIgnore},
    origin: vcsHostResults
  });

  if (language && language.verificationCommand) {
    info('Verifying the generated project');

    const subprocess = execa(language.verificationCommand, {shell: true});
    subprocess.stdout.pipe(process.stdout);
    await subprocess;
  }

  reportResults({
    nextSteps: [
      ...(gitResults && gitResults.nextSteps) ? gitResults.nextSteps : [],
      ...contributedTasks
    ]
  });
}
