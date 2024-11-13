import deepmerge from 'deepmerge';
import {execa} from 'execa';
import {questionNames as coreQuestionNames} from '@form8ion/core';
import {scaffold as scaffoldReadme} from '@form8ion/readme';
import * as resultsReporter from '@form8ion/results-reporter';

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import {scaffold as scaffoldGit} from './vcs/git/git.js';
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
vi.mock('./vcs/git/git.js');
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
  const decisions = any.simpleObject();

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
    const gitRepoShouldBeInitialized = true;
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
      .mockReturnValue({decisions, plugins: {dependencyUpdaters, languages, vcsHosts}});
    when(prompts.promptForBaseDetails)
      .calledWith(projectPath, decisions)
      .mockResolvedValue({
        [coreQuestionNames.PROJECT_NAME]: projectName,
        [questionNames.GIT_REPO]: gitRepoShouldBeInitialized,
        [coreQuestionNames.LICENSE]: license,
        [coreQuestionNames.DESCRIPTION]: description,
        [coreQuestionNames.COPYRIGHT_HOLDER]: holder,
        [coreQuestionNames.COPYRIGHT_YEAR]: year,
        [coreQuestionNames.VISIBILITY]: visibility
      });
    when(scaffoldGit)
      .calledWith(gitRepoShouldBeInitialized, projectPath, projectName, description, vcsHosts, visibility, decisions)
      .mockResolvedValue(vcsResults);
    when(licenseScaffolder.default)
      .calledWith({projectRoot: projectPath, license, copyright})
      .mockResolvedValue(licenseResults);
    scaffoldLanguage.mockResolvedValue(languageResults);
    when(dependencyUpdaterScaffolder.default)
      .calledWith(dependencyUpdaters, decisions, {projectRoot: projectPath, vcs})
      .mockResolvedValue(dependencyUpdaterResults);
    when(scaffoldContributing).calledWith({visibility}).mockReturnValue(contributingResults);

    await scaffold(options);

    expect(scaffoldReadme).toHaveBeenCalledWith({projectName, projectRoot: projectPath, description});
    expect(dependencyUpdaterScaffolder.default).toHaveBeenCalledWith(
      dependencyUpdaters,
      decisions,
      {projectRoot: projectPath, vcs}
    );
    expect(scaffoldEditorconfig).toHaveBeenCalledWith({projectRoot: projectPath});
    expect(lift).toHaveBeenCalledWith({
      projectRoot: projectPath,
      vcs,
      results: mergedResults,
      enhancers: {...dependencyUpdaters, ...vcsHosts}
    });
    expect(resultsReporter.reportResults).toHaveBeenCalledWith(mergedResults);
  });

  it('should consider all options to be optional', async () => {
    const gitRepoShouldBeInitialized = any.boolean();
    optionsValidator.validate.mockReturnValue({plugins: {}});
    when(prompts.promptForBaseDetails)
      .calledWith(projectPath, undefined)
      .mockResolvedValue({
        [coreQuestionNames.PROJECT_NAME]: projectName,
        [questionNames.GIT_REPO]: gitRepoShouldBeInitialized
      });
    when(scaffoldGit).mockResolvedValue(vcsResults);

    await scaffold();

    expect(scaffoldGit)
      .toHaveBeenCalledWith(gitRepoShouldBeInitialized, projectPath, projectName, undefined, {}, undefined, undefined);
  });

  it('should consider each option except the plugins map optional', async () => {
    const emptyOptions = {};
    when(optionsValidator.validate).calledWith(emptyOptions).mockReturnValue({plugins: {}});
    when(prompts.promptForBaseDetails).calledWith(projectPath, undefined).mockResolvedValue({});
    scaffoldGit.mockResolvedValue({});

    await scaffold(emptyOptions);
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
    when(optionsValidator.validate).calledWith(options).mockReturnValue({plugins: {vcsHosts}});
    when(prompts.promptForBaseDetails)
      .calledWith(projectPath, undefined)
      .mockResolvedValue({
        [coreQuestionNames.DESCRIPTION]: description,
        [questionNames.GIT_REPO]: true,
        [coreQuestionNames.PROJECT_NAME]: projectName,
        [coreQuestionNames.VISIBILITY]: visibility
      });
    when(scaffoldContributing).calledWith({visibility}).mockReturnValue({badges: contributingBadges});
    scaffoldLanguage.mockResolvedValue(languageResults);
    dependencyUpdaterScaffolder.default.mockResolvedValue({badges: dependencyUpdaterBadges});
    licenseScaffolder.default.mockResolvedValue({badges: licenseBadges});
    when(scaffoldGit).mockResolvedValue(vcsResults);

    await scaffold(options);

    expect(scaffoldReadme).toHaveBeenCalledWith({projectName, projectRoot: projectPath, description});
  });

  it('should not scaffold the git repo if not requested', async () => {
    when(optionsValidator.validate).calledWith(options).mockReturnValue({plugins: {}});
    prompts.promptForBaseDetails.mockResolvedValue({[questionNames.GIT_REPO]: false});
    scaffoldReadme.mockResolvedValue();
    scaffoldGit.mockResolvedValue({});

    await scaffold(options);

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
    when(optionsValidator.validate)
      .calledWith(options)
      .mockReturnValue({decisions, plugins: {languages, vcsHosts}});
    scaffoldGit.mockResolvedValue(vcsResults);
    prompts.promptForBaseDetails.mockResolvedValue({
      [coreQuestionNames.PROJECT_NAME]: projectName,
      [coreQuestionNames.VISIBILITY]: visibility,
      [questionNames.GIT_REPO]: true,
      [coreQuestionNames.LICENSE]: license,
      [coreQuestionNames.DESCRIPTION]: description
    });
    when(scaffoldLanguage).calledWith(languages, decisions, {
      projectName,
      projectRoot: projectPath,
      visibility,
      license,
      vcs,
      description
    }).mockResolvedValue(languageResults);
    when(execa).calledWith(verificationCommand, {shell: true}).mockReturnValue({stdout: {pipe: execaPipe}});
    dependencyUpdaterScaffolder.default.mockResolvedValue({});
    licenseScaffolder.default.mockResolvedValue({});
    scaffoldContributing.mockResolvedValue({});

    await scaffold(options);

    expect(scaffoldReadme).toHaveBeenCalledWith({projectName, projectRoot: projectPath, description});
    expect(execaPipe).toHaveBeenCalledWith(process.stdout);
    expect(resultsReporter.reportResults).toHaveBeenCalledWith(deepmerge.all([languageResults, vcsResults]));
  });

  it('should consider the language details to be optional', async () => {
    when(optionsValidator.validate)
      .calledWith(options)
      .mockReturnValue({vcsHosts, decisions, plugins: {languages}});
    scaffoldGit.mockResolvedValue(vcsResults);
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

    await scaffold(options);

    expect(scaffoldReadme).toHaveBeenCalledWith({projectName, projectRoot: projectPath, description});
    expect(execa).not.toHaveBeenCalled();
  });

  it('should pass the license to the language scaffolder as `UNLICENSED` when no license was chosen', async () => {
    when(optionsValidator.validate).calledWith(options).mockReturnValue({plugins: {languages}, decisions});
    prompts.promptForBaseDetails.mockResolvedValue({});
    scaffoldGit.mockResolvedValue(vcsResults);

    await scaffold(options);

    expect(scaffoldLanguage).toHaveBeenCalledWith(
      languages,
      decisions,
      {
        license: 'UNLICENSED',
        description: undefined,
        projectName: undefined,
        projectRoot: projectPath,
        vcs,
        visibility: undefined
      }
    );
  });

  it('should not run a verification command when one is not provided', async () => {
    when(optionsValidator.validate).calledWith(options).mockReturnValue({plugins: {}});
    prompts.promptForBaseDetails.mockResolvedValue({});
    scaffoldGit.mockResolvedValue({});
    scaffoldLanguage.mockResolvedValue({badges: {}, projectDetails: {}});

    await scaffold(options);

    expect(execa).not.toHaveBeenCalled();
  });
});
