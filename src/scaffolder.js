import deepmerge from 'deepmerge';
import execa from '@form8ion/execa-wrapper';
import {questionNames as coreQuestionNames} from '@form8ion/core';
import {reportResults} from '@form8ion/results-reporter';
import {scaffold as scaffoldReadme} from '@form8ion/readme';
import {info} from '@travi/cli-messages';

import {prompt as promptForLanguageDetails, scaffold as scaffoldLanguage} from './language/index.js';
import {scaffold as scaffoldGit} from './vcs/git/git.js';
import {scaffold as scaffoldLicense} from './license/index.js';
import scaffoldDependencyUpdater from './dependency-updater/scaffolder.js';
import {promptForBaseDetails} from './prompts/questions.js';
import {validate} from './options-validator.js';
import {questionNames} from './prompts/question-names.js';
import {scaffold as scaffoldEditorConfig} from './editorconfig/index.js';
import {scaffold as scaffoldContributing} from './contributing/index.js';
import lift from './lift.js';

export async function scaffold(options) {
  const projectRoot = process.cwd();
  const {decisions, plugins: {dependencyUpdaters, languages, vcsHosts = {}}} = validate(options);

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

  const [vcsResults, contributing, license] = await Promise.all([
    scaffoldGit(gitRepo, projectRoot, projectName, description, vcsHosts, visibility, decisions),
    scaffoldContributing({visibility}),
    scaffoldLicense({projectRoot, license: chosenLicense, copyright}),
    scaffoldReadme({projectName, projectRoot, description}),
    scaffoldEditorConfig({projectRoot})
  ]);

  const dependencyUpdaterResults = vcsResults.vcs && await scaffoldDependencyUpdater(
    dependencyUpdaters,
    decisions,
    {projectRoot, vcs: vcsResults.vcs}
  );

  const {[questionNames.PROJECT_LANGUAGE]: projectLanguage} = await promptForLanguageDetails(languages, decisions);

  const language = await scaffoldLanguage(
    languages,
    projectLanguage,
    {projectRoot, projectName, vcs: vcsResults.vcs, visibility, license: chosenLicense || 'UNLICENSED', description}
  );

  const mergedResults = deepmerge.all([
    license,
    language,
    dependencyUpdaterResults,
    contributing,
    vcsResults
  ].filter(Boolean));

  await lift({
    projectRoot,
    vcs: vcsResults.vcs,
    results: mergedResults,
    enhancers: {...dependencyUpdaters, ...vcsHosts}
  });

  if (language && language.verificationCommand) {
    info('Verifying the generated project');

    const subprocess = execa(language.verificationCommand, {shell: true});
    subprocess.stdout.pipe(process.stdout);
    await subprocess;
  }

  reportResults(mergedResults);
}
