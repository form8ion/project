import deepmerge from 'deepmerge';
import execa from '@form8ion/execa-wrapper';
import {questionNames as coreQuestionNames} from '@form8ion/core';
import * as resultsReporter from '@form8ion/results-reporter';

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'jest-when';

import * as readmeScaffolder from './readme';
import * as gitScaffolder from './vcs/git';
import * as vcsHostScaffolder from './vcs/host/scaffolder';
import * as licenseScaffolder from './license/scaffolder';
import * as languageScaffolder from './language/scaffolder';
import * as languagePrompt from './language/prompt';
import * as dependencyUpdaterScaffolder from './dependency-updater/scaffolder';
import * as optionsValidator from './options-validator';
import * as prompts from './prompts/questions';
import {questionNames} from './prompts/question-names';
import {scaffold as scaffoldEditorconfig} from './editorconfig';
import {scaffold as scaffoldContributing} from './contributing';
import {scaffold} from './scaffolder';

vi.mock('@form8ion/execa-wrapper');
vi.mock('@form8ion/results-reporter');
vi.mock('./readme');
vi.mock('./vcs/git');
vi.mock('./vcs/host/scaffolder');
vi.mock('./license/scaffolder');
vi.mock('./language/scaffolder');
vi.mock('./language/prompt');
vi.mock('./dependency-updater/scaffolder');
vi.mock('./options-validator');
vi.mock('./prompts/questions');
vi.mock('./editorconfig');
vi.mock('./contributing');

describe('project scaffolder', () => {
  const originalProcessCwd = process.cwd;
  const options = any.simpleObject();
  const projectPath = any.string();
  const projectName = any.string();
  const description = any.string();
  const homepage = any.url();
  const license = any.string();
  const projectLanguage = any.word();
  const licenseBadge = any.url();
  const languageScaffolders = any.simpleObject();
  const vcsHosts = any.simpleObject();
  const documentation = any.simpleObject();
  const vcs = any.simpleObject();
  const vcsOriginDetails = any.simpleObject();
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
    const overrides = {...any.simpleObject(), copyrightHolder: any.string()};
    const gitRepoShouldBeInitialized = true;
    const dependencyUpdaters = any.simpleObject();
    const gitNextSteps = any.listOf(any.simpleObject);
    const dependencyUpdaterNextSteps = any.listOf(any.simpleObject);
    const dependencyUpdaterContributionBadges = any.simpleObject();
    when(optionsValidator.validate)
      .calledWith(options)
      .mockReturnValue({languages: languageScaffolders, overrides, vcsHosts, decisions, dependencyUpdaters});
    when(prompts.promptForBaseDetails)
      .calledWith(projectPath, overrides.copyrightHolder, decisions)
      .mockResolvedValue({
        [coreQuestionNames.PROJECT_NAME]: projectName,
        [questionNames.GIT_REPO]: gitRepoShouldBeInitialized,
        [coreQuestionNames.LICENSE]: license,
        [coreQuestionNames.DESCRIPTION]: description,
        [coreQuestionNames.COPYRIGHT_HOLDER]: holder,
        [coreQuestionNames.COPYRIGHT_YEAR]: year,
        [coreQuestionNames.VISIBILITY]: visibility
      });
    when(languagePrompt.default)
      .calledWith(languageScaffolders, decisions)
      .mockResolvedValue({[questionNames.PROJECT_LANGUAGE]: projectLanguage});
    when(gitScaffolder.initialize)
      .calledWith(gitRepoShouldBeInitialized, projectPath, projectName, vcsHosts, visibility, decisions)
      .mockResolvedValue(vcs);
    gitScaffolder.scaffold.mockResolvedValue({nextSteps: gitNextSteps});
    when(licenseScaffolder.default)
      .calledWith({projectRoot: projectPath, license, copyright, vcs})
      .mockResolvedValue({badges: {consumer: {license: licenseBadge}}});
    when(vcsHostScaffolder.default)
      .calledWith(
        vcsHosts,
        {
          ...vcs,
          projectRoot: projectPath,
          projectType: projectLanguage,
          description,
          visibility,
          homepage: undefined,
          nextSteps: [...dependencyUpdaterNextSteps],
          tags
        }
      )
      .mockResolvedValue(vcsOriginDetails);
    languageScaffolder.default.mockResolvedValue({
      badges: {status: {ci: ciBadge}},
      vcsIgnore,
      projectDetails: {},
      documentation,
      tags
    });
    when(dependencyUpdaterScaffolder.default)
      .calledWith(dependencyUpdaters, decisions, {projectRoot: projectPath, vcs})
      .mockResolvedValue({
        badges: {contribution: dependencyUpdaterContributionBadges},
        nextSteps: dependencyUpdaterNextSteps
      });

    await scaffold(options);

    expect(gitScaffolder.scaffold).toHaveBeenCalledWith({
      projectRoot: projectPath,
      ignore: vcsIgnore,
      origin: vcsOriginDetails
    });
    expect(readmeScaffolder.default).toHaveBeenCalledWith({
      projectName,
      projectRoot: projectPath,
      description,
      documentation,
      badges: {
        consumer: {license: licenseBadge},
        status: {ci: ciBadge},
        contribution: dependencyUpdaterContributionBadges
      }
    });
    expect(dependencyUpdaterScaffolder.default).toHaveBeenCalledWith(
      dependencyUpdaters,
      decisions,
      {projectRoot: projectPath, vcs}
    );
    expect(scaffoldEditorconfig).toHaveBeenCalledWith({projectRoot: projectPath});
    expect(resultsReporter.reportResults).toHaveBeenCalledWith({
      nextSteps: [...gitNextSteps, ...dependencyUpdaterNextSteps]
    });
  });

  it('should consider all options to be optional', async () => {
    const gitRepoShouldBeInitialized = any.boolean();
    optionsValidator.validate.mockReturnValue({});
    when(prompts.promptForBaseDetails)
      .calledWith(projectPath, undefined, undefined)
      .mockResolvedValue({
        [coreQuestionNames.PROJECT_NAME]: projectName,
        [questionNames.GIT_REPO]: gitRepoShouldBeInitialized
      });
    languagePrompt.default.mockResolvedValue({});

    await scaffold();

    expect(gitScaffolder.initialize)
      .toHaveBeenCalledWith(gitRepoShouldBeInitialized, projectPath, projectName, {}, undefined, undefined);
  });

  it('should consider each option optional', async () => {
    const emptyOptions = {};
    when(optionsValidator.validate).calledWith(emptyOptions).mockReturnValue({});
    when(prompts.promptForBaseDetails).calledWith(projectPath, undefined, undefined).mockResolvedValue({});
    languagePrompt.default.mockResolvedValue({});
    gitScaffolder.initialize.mockResolvedValue({});

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
    when(prompts.promptForBaseDetails)
      .calledWith(projectPath, undefined, undefined)
      .mockResolvedValue({[coreQuestionNames.VISIBILITY]: visibility});
    when(scaffoldContributing).calledWith({visibility}).mockReturnValue({badges: contributingBadges});
    languageScaffolder.default.mockResolvedValue({badges: languageBadges, vcsIgnore, documentation});
    vcsHostScaffolder.default.mockResolvedValue(vcsOriginDetails);
    dependencyUpdaterScaffolder.default.mockResolvedValue({badges: dependencyUpdaterBadges});
    licenseScaffolder.default.mockResolvedValue({badges: licenseBadges});

    await scaffold(options);

    expect(gitScaffolder.scaffold).toHaveBeenCalledWith({
      projectRoot: projectPath,
      origin: vcsOriginDetails,
      ignore: vcsIgnore
    });
    expect(readmeScaffolder.default).toHaveBeenCalledWith({
      projectName,
      projectRoot: projectPath,
      description,
      badges: deepmerge.all([licenseBadges, languageBadges, dependencyUpdaterBadges, contributingBadges]),
      documentation
    });
  });

  it('should not scaffold the git repo if not requested', async () => {
    when(optionsValidator.validate).calledWith(options).mockReturnValue({});
    prompts.promptForBaseDetails.mockResolvedValue({[questionNames.GIT_REPO]: false});
    languagePrompt.default.mockResolvedValue({});
    readmeScaffolder.default.mockResolvedValue();
    gitScaffolder.initialize.mockResolvedValue(undefined);

    await scaffold(options);

    expect(gitScaffolder.scaffold).not.toHaveBeenCalled();
    expect(vcsHostScaffolder.default).not.toHaveBeenCalled();
    expect(dependencyUpdaterScaffolder.default).not.toHaveBeenCalled();
  });

  it('should scaffold the details of the chosen language plugin', async () => {
    const gitNextSteps = any.listOf(any.simpleObject);
    const languageConsumerBadges = any.simpleObject();
    const languageContributionBadges = any.simpleObject();
    const languageStatusBadges = any.simpleObject();
    const languageNextSteps = any.listOf(any.simpleObject);
    const verificationCommand = any.string();
    const execaPipe = vi.fn();
    when(optionsValidator.validate)
      .calledWith(options)
      .mockReturnValue({languages: languageScaffolders, vcsHosts, decisions});
    gitScaffolder.initialize.mockResolvedValue(vcs);
    gitScaffolder.scaffold.mockResolvedValue({nextSteps: gitNextSteps});
    prompts.promptForBaseDetails.mockResolvedValue({
      [coreQuestionNames.PROJECT_NAME]: projectName,
      [coreQuestionNames.VISIBILITY]: visibility,
      [questionNames.GIT_REPO]: true,
      [coreQuestionNames.LICENSE]: license,
      [coreQuestionNames.DESCRIPTION]: description
    });
    when(languagePrompt.default)
      .calledWith(languageScaffolders, decisions)
      .mockResolvedValue({[questionNames.PROJECT_LANGUAGE]: projectLanguage});
    when(languageScaffolder.default).calledWith(languageScaffolders, projectLanguage, {
      projectName,
      projectRoot: projectPath,
      visibility,
      license,
      vcs,
      description
    }).mockResolvedValue({
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
    });
    when(vcsHostScaffolder.default).calledWith(
      vcsHosts,
      {
        ...vcs,
        projectRoot: projectPath,
        projectType: projectLanguage,
        description,
        homepage,
        visibility,
        nextSteps: languageNextSteps,
        tags
      }
    ).mockResolvedValue(vcsOriginDetails);
    when(execa).calledWith(verificationCommand, {shell: true}).mockReturnValue({stdout: {pipe: execaPipe}});
    dependencyUpdaterScaffolder.default.mockResolvedValue({});
    licenseScaffolder.default.mockResolvedValue({});
    scaffoldContributing.mockResolvedValue({});

    await scaffold(options);

    expect(gitScaffolder.scaffold).toHaveBeenCalledWith({
      projectRoot: projectPath,
      ignore: vcsIgnore,
      origin: vcsOriginDetails
    });
    expect(readmeScaffolder.default).toHaveBeenCalledWith({
      projectName,
      projectRoot: projectPath,
      description,
      documentation,
      badges: {
        consumer: languageConsumerBadges,
        status: languageStatusBadges,
        contribution: languageContributionBadges
      }
    });
    expect(execaPipe).toHaveBeenCalledWith(process.stdout);
    expect(resultsReporter.reportResults).toHaveBeenCalledWith({nextSteps: [...gitNextSteps, ...languageNextSteps]});
  });

  it('should consider the language details to be optional', async () => {
    when(optionsValidator.validate)
      .calledWith(options)
      .mockReturnValue({languages: languageScaffolders, vcsHosts, decisions});
    gitScaffolder.initialize.mockResolvedValue(vcs);
    prompts.promptForBaseDetails.mockResolvedValue({
      [coreQuestionNames.PROJECT_NAME]: projectName,
      [coreQuestionNames.VISIBILITY]: visibility,
      [questionNames.GIT_REPO]: true,
      [coreQuestionNames.LICENSE]: license,
      [coreQuestionNames.DESCRIPTION]: description
    });
    when(languagePrompt.default)
      .calledWith(languageScaffolders, decisions)
      .mockResolvedValue({[questionNames.PROJECT_LANGUAGE]: projectLanguage});
    vcsHostScaffolder.default.mockResolvedValue(vcsOriginDetails);
    languageScaffolder.default.mockResolvedValue({});
    dependencyUpdaterScaffolder.default.mockResolvedValue({});
    licenseScaffolder.default.mockResolvedValue({});
    scaffoldContributing.mockResolvedValue({});

    await scaffold(options);

    expect(gitScaffolder.scaffold).toHaveBeenCalledWith({
      projectRoot: projectPath,
      ignore: undefined,
      origin: vcsOriginDetails
    });
    expect(readmeScaffolder.default).toHaveBeenCalledWith({
      projectName,
      projectRoot: projectPath,
      description,
      documentation: undefined,
      badges: {consumer: {}, status: {}, contribution: {}}
    });
    expect(execa).not.toHaveBeenCalled();
  });

  it('should pass the license to the language scaffolder as `UNLICENSED` when no license was chosen', async () => {
    when(optionsValidator.validate).calledWith(options).mockReturnValue({});
    prompts.promptForBaseDetails.mockResolvedValue({});
    languagePrompt.default.mockResolvedValue({[questionNames.PROJECT_LANGUAGE]: projectLanguage});
    gitScaffolder.initialize.mockResolvedValue({});

    await scaffold(options);

    expect(languageScaffolder.default).toHaveBeenCalledWith(
      {},
      projectLanguage,
      {
        license: 'UNLICENSED',
        description: undefined,
        projectName: undefined,
        projectRoot: projectPath,
        vcs: {},
        visibility: undefined
      }
    );
  });

  it('should not run a verification command when one is not provided', async () => {
    when(optionsValidator.validate).calledWith(options).mockReturnValue({});
    prompts.promptForBaseDetails.mockResolvedValue({});
    languagePrompt.default.mockResolvedValue({});
    gitScaffolder.initialize.mockResolvedValue({});
    languageScaffolder.default.mockResolvedValue({badges: {}, projectDetails: {}});

    await scaffold(options);

    expect(execa).not.toHaveBeenCalled();
  });
});
