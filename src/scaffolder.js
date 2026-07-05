import deepmerge from 'deepmerge';
import {execa} from 'execa';
import {questionNames as coreQuestionNames, ungroupObject} from '@form8ion/core';
import {scaffold as scaffoldReadme} from '@form8ion/readme';

import {scaffold as scaffoldLanguage} from './language/index.js';
import {scaffold as scaffoldVcs} from './vcs/index.js';
import {scaffold as scaffoldLicense} from './license/index.js';
import scaffoldDependencyUpdater from './dependency-updater/scaffolder.js';
import {scaffold as scaffoldCiProvider} from './ci-provider/index.js';
import {scaffold as scaffoldCoverageService} from './coverage-service/index.js';
import {promptForBaseDetails} from './prompts/questions.js';
import {validate} from './options-validator.js';
import {scaffold as scaffoldEditorConfig} from './editorconfig/index.js';
import {scaffold as scaffoldContributing} from './contributing/index.js';
import lift from './lift.js';

export async function scaffold(options, dependencies) {
  const projectRoot = process.cwd();
  const {plugins} = validate(options);
  const {dependencyUpdaters, ciProviders, coverageServices, languages, vcsHosts = {}} = plugins;
  const {prompt, logger} = dependencies;

  const {
    [coreQuestionNames.PROJECT_NAME]: projectName,
    [coreQuestionNames.LICENSE]: chosenLicense,
    [coreQuestionNames.VISIBILITY]: visibility,
    [coreQuestionNames.DESCRIPTION]: description,
    [coreQuestionNames.COPYRIGHT_YEAR]: copyrightYear,
    [coreQuestionNames.COPYRIGHT_HOLDER]: copyHolder
  } = await promptForBaseDetails(projectRoot, {prompt});
  const copyright = {year: copyrightYear, holder: copyHolder};

  const [vcsResults, contributing, license] = await Promise.all([
    scaffoldVcs({projectRoot, projectName, vcsHosts, visibility, description}, {prompt, logger}),
    scaffoldContributing({visibility}),
    scaffoldLicense({projectRoot, license: chosenLicense, copyright}, {logger}),
    scaffoldReadme({projectName, projectRoot, description}, {logger}),
    scaffoldEditorConfig({projectRoot})
  ]);

  const [dependencyUpdaterResults] = vcsResults.vcs
    ? await Promise.all([
      scaffoldDependencyUpdater({plugins: dependencyUpdaters, options: {projectRoot}}, {prompt}),
      scaffoldCiProvider({plugins: ciProviders, options: {projectRoot}}, {prompt}),
      scaffoldCoverageService({plugins: coverageServices, options: {projectRoot}}, {prompt})
    ])
    : [];

  const language = await scaffoldLanguage(
    languages,
    {projectRoot, projectName, vcs: vcsResults.vcs, visibility, license: chosenLicense || 'UNLICENSED', description},
    {prompt}
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
    enhancers: ungroupObject(plugins)
  }, dependencies);

  if (language && language.verificationCommand) {
    logger.info('Verifying the generated project');

    const subprocess = execa(language.verificationCommand, {shell: true});
    subprocess.stdout.pipe(process.stdout);
    await subprocess;
  }

  return mergedResults;
}
