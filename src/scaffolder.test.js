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
import {scaffold} from './scaffolder';

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

describe('project scaffolder', () => {
  const originalProcessCwd = process.cwd;
  const options = any.simpleObject();
  const projectPath = any.string();
  const projectName = any.string();
  const description = any.string();
  // const homepage = any.url();
  const license = any.string();
  const projectLanguage = any.word();
  const licenseBadge = any.url();
  const scaffolders = any.simpleObject();
  const vcsHosts = any.simpleObject();
  const documentation = any.simpleObject();
  const vcs = any.simpleObject();
  const vcsOriginDetails = any.simpleObject();
  const tags = any.listOf(any.word);

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
    const visibility = any.word();
    const overrides = {...any.simpleObject(), copyrightHolder: any.string()};
    const vcsIgnore = any.simpleObject();
    const gitRepoShouldBeInitialized = true;
    const dependencyUpdaters = any.simpleObject();
    const decisions = any.simpleObject();
    const gitNextSteps = any.listOf(any.simpleObject);
    const dependencyUpdaterNextSteps = any.listOf(any.simpleObject);
    const dependencyUpdaterContributionBadges = any.simpleObject();
    when(optionsValidator.validate)
      .calledWith(options)
      .mockReturnValue({languages: scaffolders, overrides, vcsHosts, decisions, dependencyUpdaters});
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
      .calledWith(scaffolders, decisions)
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
});
