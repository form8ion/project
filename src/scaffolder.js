import deepmerge from 'deepmerge';
import execa from '@form8ion/execa-wrapper';
import {questionNames as coreQuestionNames} from '@form8ion/core';
import {reportResults} from '@form8ion/results-reporter';
import {scaffold as scaffoldReadme} from '@form8ion/readme';
import {info} from '@travi/cli-messages';

import {scaffold as scaffoldLanguage, prompt as promptForLanguageDetails} from './language/index.js';
import {initialize as scaffoldGit, scaffold as liftGit} from './vcs/git/git.js';
import {scaffold as scaffoldLicense} from './license/index.js';
import {scaffold as scaffoldVcsHost} from './vcs/host/index.js';
import scaffoldDependencyUpdater from './dependency-updater/scaffolder.js';
import {promptForBaseDetails} from './prompts/questions.js';
import {validate} from './options-validator.js';
import {questionNames} from './prompts/question-names.js';
import {scaffold as scaffoldEditorConfig} from './editorconfig/index.js';
import {scaffold as scaffoldContributing} from './contributing/index.js';
import lift from './lift.js';

export async function scaffold(options) {
  const projectRoot = process.cwd();
  const {vcsHosts = {}, decisions, plugins: {dependencyUpdaters, languages = {}}} = validate(options);

  const {
    [coreQuestionNames.PROJECT_NAME]: projectName,
    [coreQuestionNames.LICENSE]: chosenLicense,
    [coreQuestionNames.VISIBILITY]: visibility,
    [coreQuestionNames.DESCRIPTION]: description,
    [questionNames.GIT_REPO]: gitRepo,
    [coreQuestionNames.COPYRIGHT_YEAR]: copyrightYear,
    [coreQuestionNames.COPYRIGHT_HOLDER]: copyHolder
  } = await promptForBaseDetails(projectRoot, decisions);
  const copyright = {year: copyrightYear, holder: copyHolder};

  const [vcs, contributing, license] = await Promise.all([
    scaffoldGit(gitRepo, projectRoot, projectName, vcsHosts, visibility, decisions),
    scaffoldContributing({visibility}),
    scaffoldLicense({projectRoot, license: chosenLicense, copyright}),
    scaffoldReadme({projectName, projectRoot, description}),
    scaffoldEditorConfig({projectRoot})
  ]);

  const {[questionNames.PROJECT_LANGUAGE]: projectLanguage} = await promptForLanguageDetails(languages, decisions);

  const language = await scaffoldLanguage(
    languages,
    projectLanguage,
    {projectRoot, projectName, vcs, visibility, license: chosenLicense || 'UNLICENSED', description}
  );

  const dependencyUpdaterResults = vcs && await scaffoldDependencyUpdater(
    dependencyUpdaters,
    decisions,
    {projectRoot, vcs}
  );

  const contributors = [license, language, dependencyUpdaterResults, contributing].filter(Boolean);
  const contributedTasks = contributors
    .map(contributor => contributor.nextSteps)
    .filter(Boolean)
    .reduce((acc, contributedNextSteps) => ([...acc, ...contributedNextSteps]), []);

  const vcsHostResults = vcs && await scaffoldVcsHost(vcsHosts, {
    ...vcs,
    projectRoot,
    description,
    visibility,
    ...language && {
      homepage: language.projectDetails && language.projectDetails.homepage,
      tags: language.tags
    },
    nextSteps: contributedTasks
  });

  await lift({projectRoot, results: deepmerge.all(contributors)});

  const gitResults = gitRepo && await liftGit({projectRoot, origin: vcsHostResults});

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
