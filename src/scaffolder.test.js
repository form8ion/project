import deepmerge from 'deepmerge';
import {execa} from 'execa';
import {questionNames as coreQuestionNames} from '@form8ion/core';
import {scaffold as scaffoldReadme} from '@form8ion/readme';
import * as resultsReporter from '@form8ion/results-reporter';

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import {scaffold as scaffoldVcs} from './vcs/index.js';
import * as licenseScaffolder from './license/scaffolder.js';
import scaffoldLanguage from './language/scaffolder.js';
import * as dependencyUpdaterScaffolder from './dependency-updater/scaffolder.js';
import * as optionsValidator from './options-validator.js';
import * as prompts from './prompts/questions.js';
import {questionNames} from './prompts/question-names.js';
import {scaffold as scaffoldEditorconfig} from './editorconfig/index.js';
import {scaffold as scaffoldContributing} from './contributing/index.js';
import lift from './lift.js';
import {scaffold} from './scaffolder.js';

vi.mock('execa');
vi.mock('@form8ion/readme');
vi.mock('@form8ion/results-reporter');
vi.mock('./readme');
vi.mock('./vcs/index.js');
vi.mock('./license/scaffolder');
vi.mock('./language/scaffolder');
vi.mock('./dependency-updater/scaffolder');
vi.mock('./options-validator');
vi.mock('./prompts/questions');
vi.mock('./editorconfig');
vi.mock('./contributing');
vi.mock('./lift.js');

describe('project scaffolder', () => {
  const originalProcessCwd = process.cwd;
  const options = any.simpleObject();
  const projectPath = any.string();
  const projectName = any.string();
  const description = any.string();
  const homepage = any.url();
  const license = any.string();
  const licenseBadge = any.url();
  const languages = any.simpleObject();
  const vcsHosts = any.simpleObject();
  const documentation = any.simpleObject();
  const vcs = any.simpleObject();
  const gitNextSteps = any.listOf(any.simpleObject);
  const vcsResults = {...any.simpleObject(), vcs, nextSteps: gitNextSteps};
  const tags = any.listOf(any.word);
  const visibility = any.word();
  const vcsIgnore = any.simpleObject();
  const prompt = () => undefined;

  beforeEach(() => {
    process.cwd = vi.fn();
    process.cwd.mockReturnValue(projectPath);
  });

  afterEach(() => {
    vi.clearAllMocks();

    process.cwd = originalProcessCwd;
  });

  it('should generate the project files', async () => {
    const ciBadge = any.url();
    const year = any.word();
    const holder = any.sentence();
    const copyright = {year, holder};
    const dependencyUpdaters = any.simpleObject();
    const dependencyUpdaterNextSteps = any.listOf(any.simpleObject);
    const dependencyUpdaterContributionBadges = any.simpleObject();
    const dependencyUpdaterResults = {
      badges: {contribution: dependencyUpdaterContributionBadges},
      nextSteps: dependencyUpdaterNextSteps
    };
    const languageResults = {
      badges: {status: {ci: ciBadge}},
      vcsIgnore,
      projectDetails: {},
      documentation,
      tags
    };
    const licenseResults = {badges: {consumer: {license: licenseBadge}}};
    const contributingResults = any.simpleObject();
    const mergedResults = deepmerge.all([
      licenseResults,
      languageResults,
      dependencyUpdaterResults,
      contributingResults,
      vcsResults
    ]);
    when(optionsValidator.validate)
      .calledWith(options)
      .thenReturn({plugins: {dependencyUpdaters, languages, vcsHosts}});
    when(prompts.promptForBaseDetails)
      .calledWith(projectPath, {prompt})
      .thenResolve({
        [coreQuestionNames.PROJECT_NAME]: projectName,
        [coreQuestionNames.LICENSE]: license,
        [coreQuestionNames.DESCRIPTION]: description,
        [coreQuestionNames.COPYRIGHT_HOLDER]: holder,
        [coreQuestionNames.COPYRIGHT_YEAR]: year,
        [coreQuestionNames.VISIBILITY]: visibility
      });
    when(scaffoldVcs)
      .calledWith({projectRoot: projectPath, projectName, vcsHosts, visibility, description}, {prompt})
      .thenResolve(vcsResults);
    when(licenseScaffolder.default)
      .calledWith({projectRoot: projectPath, license, copyright})
      .thenResolve(licenseResults);
    scaffoldLanguage.mockResolvedValue(languageResults);
    when(dependencyUpdaterScaffolder.default)
      .calledWith(dependencyUpdaters, {projectRoot: projectPath}, {prompt})
      .thenResolve(dependencyUpdaterResults);
    when(scaffoldContributing).calledWith({visibility}).thenReturn(contributingResults);

    await scaffold(options, {prompt});

    expect(scaffoldReadme).toHaveBeenCalledWith({projectName, projectRoot: projectPath, description});
    expect(scaffoldEditorconfig).toHaveBeenCalledWith({projectRoot: projectPath});
    expect(lift).toHaveBeenCalledWith({
      projectRoot: projectPath,
      vcs,
      results: mergedResults,
      enhancers: {...dependencyUpdaters, ...vcsHosts, ...languages}
    });
    expect(resultsReporter.reportResults).toHaveBeenCalledWith(mergedResults);
  });

  it('should pass the lists of badges from contributors to the readme', async () => {
    const contributingBadges = {
      consumer: any.simpleObject(),
      status: any.simpleObject(),
      contribution: any.simpleObject()
    };
    const languageBadges = {
      consumer: any.simpleObject(),
      status: any.simpleObject(),
      contribution: any.simpleObject()
    };
    const dependencyUpdaterBadges = {
      consumer: any.simpleObject(),
      status: any.simpleObject(),
      contribution: any.simpleObject()
    };
    const licenseBadges = {
      consumer: any.simpleObject(),
      status: any.simpleObject(),
      contribution: any.simpleObject()
    };
    const languageResults = {badges: languageBadges, vcsIgnore, documentation};
    when(optionsValidator.validate).calledWith(options).thenReturn({plugins: {vcsHosts}});
    when(prompts.promptForBaseDetails)
      .calledWith(projectPath, {prompt})
      .thenResolve({
        [coreQuestionNames.DESCRIPTION]: description,
        [questionNames.GIT_REPO]: true,
        [coreQuestionNames.PROJECT_NAME]: projectName,
        [coreQuestionNames.VISIBILITY]: visibility
      });
    when(scaffoldContributing).calledWith({visibility}).thenReturn({badges: contributingBadges});
    scaffoldLanguage.mockResolvedValue(languageResults);
    dependencyUpdaterScaffolder.default.mockResolvedValue({badges: dependencyUpdaterBadges});
    licenseScaffolder.default.mockResolvedValue({badges: licenseBadges});
    scaffoldVcs.mockResolvedValue(vcsResults);

    await scaffold(options, {prompt});

    expect(scaffoldReadme).toHaveBeenCalledWith({projectName, projectRoot: projectPath, description});
  });

  it('should not scaffold the git repo if not requested', async () => {
    when(optionsValidator.validate).calledWith(options).thenReturn({plugins: {}});
    prompts.promptForBaseDetails.mockResolvedValue({[questionNames.GIT_REPO]: false});
    scaffoldReadme.mockResolvedValue();
    scaffoldVcs.mockResolvedValue({});

    await scaffold(options, {prompt});

    expect(dependencyUpdaterScaffolder.default).not.toHaveBeenCalled();
  });

  it('should scaffold the details of the chosen language plugin', async () => {
    const languageConsumerBadges = any.simpleObject();
    const languageContributionBadges = any.simpleObject();
    const languageStatusBadges = any.simpleObject();
    const languageNextSteps = any.listOf(any.simpleObject);
    const verificationCommand = any.string();
    const execaPipe = vi.fn();
    const languageResults = {
      vcsIgnore,
      badges: {
        consumer: languageConsumerBadges,
        contribution: languageContributionBadges,
        status: languageStatusBadges
      },
      documentation,
      verificationCommand,
      projectDetails: {homepage},
      nextSteps: languageNextSteps,
      tags
    };
    when(optionsValidator.validate).calledWith(options).thenReturn({plugins: {languages, vcsHosts}});
    scaffoldVcs.mockResolvedValue(vcsResults);
    prompts.promptForBaseDetails.mockResolvedValue({
      [coreQuestionNames.PROJECT_NAME]: projectName,
      [coreQuestionNames.VISIBILITY]: visibility,
      [questionNames.GIT_REPO]: true,
      [coreQuestionNames.LICENSE]: license,
      [coreQuestionNames.DESCRIPTION]: description
    });
    when(scaffoldLanguage).calledWith(languages, {
      projectName,
      projectRoot: projectPath,
      visibility,
      license,
      vcs,
      description
    }, {prompt}).thenResolve(languageResults);
    when(execa).calledWith(verificationCommand, {shell: true}).thenReturn({stdout: {pipe: execaPipe}});
    dependencyUpdaterScaffolder.default.mockResolvedValue({});
    licenseScaffolder.default.mockResolvedValue({});
    scaffoldContributing.mockResolvedValue({});

    await scaffold(options, {prompt});

    expect(scaffoldReadme).toHaveBeenCalledWith({projectName, projectRoot: projectPath, description});
    expect(execaPipe).toHaveBeenCalledWith(process.stdout);
    expect(resultsReporter.reportResults).toHaveBeenCalledWith(deepmerge.all([languageResults, vcsResults]));
  });

  it('should consider the language details to be optional', async () => {
    when(optionsValidator.validate)
      .calledWith(options)
      .thenReturn({vcsHosts, plugins: {languages}});
    scaffoldVcs.mockResolvedValue(vcsResults);
    prompts.promptForBaseDetails.mockResolvedValue({
      [coreQuestionNames.PROJECT_NAME]: projectName,
      [coreQuestionNames.VISIBILITY]: visibility,
      [questionNames.GIT_REPO]: true,
      [coreQuestionNames.LICENSE]: license,
      [coreQuestionNames.DESCRIPTION]: description
    });
    scaffoldLanguage.mockResolvedValue({});
    dependencyUpdaterScaffolder.default.mockResolvedValue({});
    licenseScaffolder.default.mockResolvedValue({});
    scaffoldContributing.mockResolvedValue({});

    await scaffold(options, {prompt});

    expect(scaffoldReadme).toHaveBeenCalledWith({projectName, projectRoot: projectPath, description});
    expect(execa).not.toHaveBeenCalled();
  });

  it('should pass the license to the language scaffolder as `UNLICENSED` when no license was chosen', async () => {
    when(optionsValidator.validate).calledWith(options).thenReturn({plugins: {languages}});
    prompts.promptForBaseDetails.mockResolvedValue({});
    scaffoldVcs.mockResolvedValue(vcsResults);

    await scaffold(options, {prompt});

    expect(scaffoldLanguage).toHaveBeenCalledWith(
      languages,
      {
        license: 'UNLICENSED',
        description: undefined,
        projectName: undefined,
        projectRoot: projectPath,
        vcs,
        visibility: undefined
      },
      {prompt}
    );
  });

  it('should not run a verification command when one is not provided', async () => {
    when(optionsValidator.validate).calledWith(options).thenReturn({plugins: {}});
    prompts.promptForBaseDetails.mockResolvedValue({});
    scaffoldVcs.mockResolvedValue({});
    scaffoldLanguage.mockResolvedValue({badges: {}, projectDetails: {}});

    await scaffold(options, {prompt});

    expect(execa).not.toHaveBeenCalled();
  });
});
