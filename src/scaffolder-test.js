import path from 'path';
import {promises} from 'fs';
import {questionNames as coreQuestionNames} from '@form8ion/core';
import * as resultsReporter from '@form8ion/results-reporter';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as readmeScaffolder from './readme';
import * as gitScaffolder from './vcs/git';
import * as vcsHostScaffolder from './vcs/host';
import * as licenseScaffolder from './license/scaffolder';
import * as languageScaffolder from './language-scaffolder';
import * as dependencyUpdaterScaffolder from './dependency-updater/scaffolder';
import * as execa from '../thirdparty-wrappers/execa';
import * as prompts from './prompts/questions';
import * as optionsValidator from './options-validator';
import {scaffold} from './scaffolder';
import {questionNames} from './prompts/question-names';

suite('project scaffolder', () => {
  let sandbox;
  const options = any.simpleObject();
  const projectPath = any.string();
  const projectName = any.string();
  const repoHost = any.word();
  const repoOwner = any.word();
  const description = any.string();
  const homepage = any.url();
  const license = any.string();
  const projectLanguage = any.word();
  const licenseBadge = any.url();
  const scaffolders = any.simpleObject();
  const vcsHosts = any.simpleObject();
  const documentation = any.simpleObject();
  const vcs = any.simpleObject();
  const vcsOriginDetails = any.simpleObject();
  const tags = any.listOf(any.word);

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(process, 'cwd');
    sandbox.stub(prompts, 'promptForBaseDetails');
    sandbox.stub(prompts, 'promptForLanguageDetails');
    sandbox.stub(prompts, 'promptForVcsHostDetails');
    sandbox.stub(optionsValidator, 'validate');
    sandbox.stub(readmeScaffolder, 'default');
    sandbox.stub(gitScaffolder, 'initialize');
    sandbox.stub(gitScaffolder, 'scaffold');
    sandbox.stub(vcsHostScaffolder, 'default');
    sandbox.stub(licenseScaffolder, 'default');
    sandbox.stub(languageScaffolder, 'scaffold');
    sandbox.stub(dependencyUpdaterScaffolder, 'default');
    sandbox.stub(promises, 'copyFile');
    sandbox.stub(execa, 'default');
    sandbox.stub(resultsReporter, 'reportResults');

    process.cwd.returns(projectPath);
    promises.copyFile.resolves();
    licenseScaffolder.default.resolves({});
  });

  teardown(() => sandbox.restore());

  test('that project files are generated', async () => {
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
    optionsValidator.validate
      .withArgs(options)
      .returns({languages: scaffolders, overrides, vcsHosts, decisions, dependencyUpdaters});
    prompts.promptForBaseDetails
      .withArgs(projectPath, overrides.copyrightHolder, decisions)
      .resolves({
        [coreQuestionNames.PROJECT_NAME]: projectName,
        [questionNames.GIT_REPO]: gitRepoShouldBeInitialized,
        [coreQuestionNames.LICENSE]: license,
        [coreQuestionNames.DESCRIPTION]: description,
        [coreQuestionNames.COPYRIGHT_HOLDER]: holder,
        [coreQuestionNames.COPYRIGHT_YEAR]: year,
        [coreQuestionNames.VISIBILITY]: visibility
      });
    prompts.promptForLanguageDetails
      .withArgs(scaffolders, decisions)
      .resolves({[questionNames.PROJECT_LANGUAGE]: projectLanguage});
    readmeScaffolder.default.resolves();
    gitScaffolder.initialize
      .withArgs(gitRepoShouldBeInitialized, projectPath, projectName, vcsHosts, visibility, decisions)
      .resolves(vcs);
    gitScaffolder.scaffold.resolves({nextSteps: gitNextSteps});
    licenseScaffolder.default
      .withArgs({projectRoot: projectPath, license, copyright, vcs})
      .resolves({badges: {consumer: {license: licenseBadge}}});
    vcsHostScaffolder.default
      .withArgs(
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
      .resolves(vcsOriginDetails);
    languageScaffolder.scaffold
      .resolves({badges: {status: {ci: ciBadge}}, vcsIgnore, projectDetails: {}, documentation, tags});
    dependencyUpdaterScaffolder.default
      .withArgs(dependencyUpdaters, decisions, {projectRoot: projectPath, vcs})
      .resolves({badges: {contribution: dependencyUpdaterContributionBadges}, nextSteps: dependencyUpdaterNextSteps});

    await scaffold(options);

    assert.calledWith(
      gitScaffolder.scaffold,
      {projectRoot: projectPath, ignore: vcsIgnore, origin: vcsOriginDetails}
    );
    assert.calledWith(
      readmeScaffolder.default,
      {
        projectName,
        projectRoot: projectPath,
        description,
        documentation,
        badges: {
          consumer: {license: licenseBadge},
          status: {ci: ciBadge},
          contribution: dependencyUpdaterContributionBadges
        }
      }
    );
    assert.calledWith(
      dependencyUpdaterScaffolder.default,
      dependencyUpdaters,
      decisions,
      {projectRoot: projectPath, vcs}
    );
    assert.calledWith(
      promises.copyFile,
      path.resolve(__dirname, '..', 'templates', 'editorconfig.txt'),
      `${projectPath}/.editorconfig`
    );
    assert.calledWith(resultsReporter.reportResults, {nextSteps: [...gitNextSteps, ...dependencyUpdaterNextSteps]});
  });

  test('that the options are optional', async () => {
    const gitRepoShouldBeInitialized = any.boolean();
    optionsValidator.validate.returns({});
    prompts.promptForBaseDetails
      .withArgs(projectPath, undefined)
      .resolves({[coreQuestionNames.PROJECT_NAME]: projectName, [questionNames.GIT_REPO]: gitRepoShouldBeInitialized});
    prompts.promptForLanguageDetails.resolves({});

    await scaffold();

    assert.calledWith(gitScaffolder.initialize, gitRepoShouldBeInitialized, projectPath, projectName, {});
  });

  test('that each option is optional', () => {
    const emptyOptions = {};
    optionsValidator.validate.withArgs(emptyOptions).returns({});
    prompts.promptForBaseDetails.withArgs(projectPath, undefined).resolves({});
    prompts.promptForLanguageDetails.resolves({});
    gitScaffolder.initialize.resolves({});

    return scaffold(emptyOptions);
  });

  test('that the PRs-welcome badge is included for public projects', () => {
    optionsValidator.validate.withArgs(options).returns({});
    prompts.promptForBaseDetails.resolves({
      [coreQuestionNames.PROJECT_NAME]: projectName,
      [coreQuestionNames.LICENSE]: license,
      [questionNames.GIT_REPO]: true,
      [coreQuestionNames.DESCRIPTION]: description,
      [coreQuestionNames.VISIBILITY]: 'Public'
    });
    prompts.promptForLanguageDetails.resolves({});
    gitScaffolder.initialize.resolves({});
    vcsHostScaffolder.default.resolves(vcsOriginDetails);

    return scaffold(options).then(() => {
      assert.calledWith(gitScaffolder.scaffold, {projectRoot: projectPath, origin: vcsOriginDetails});
      assert.calledWith(
        readmeScaffolder.default,
        {
          projectName,
          projectRoot: projectPath,
          description,
          badges: {
            consumer: {},
            status: {},
            contribution: {
              PRs: {
                text: 'PRs Welcome',
                link: 'http://makeapullrequest.com',
                img: 'https://img.shields.io/badge/PRs-welcome-brightgreen.svg'
              }
            }
          }
        }
      );
    });
  });

  test('that the badge lists passed to the readme are empty if none are defined', () => {
    optionsValidator.validate.withArgs(options).returns({});
    licenseScaffolder.default.resolves({});
    prompts.promptForBaseDetails.resolves({
      [coreQuestionNames.PROJECT_NAME]: projectName,
      [coreQuestionNames.LICENSE]: license,
      [coreQuestionNames.DESCRIPTION]: description,
      [questionNames.GIT_REPO]: false
    });
    prompts.promptForLanguageDetails.resolves({});
    readmeScaffolder.default.resolves();
    gitScaffolder.initialize.resolves({});

    return scaffold(options).then(() => {
      assert.notCalled(prompts.promptForVcsHostDetails);
      assert.calledWith(
        readmeScaffolder.default,
        {
          projectName,
          projectRoot: projectPath,
          description,
          badges: {consumer: {}, status: {}, contribution: {}}
        }
      );
    });
  });

  test('that the git repo is not initialized if not requested', async () => {
    optionsValidator.validate.withArgs(options).returns({});
    prompts.promptForBaseDetails.resolves({[questionNames.GIT_REPO]: false});
    prompts.promptForLanguageDetails.resolves({});
    readmeScaffolder.default.resolves();
    gitScaffolder.initialize.resolves(undefined);

    await scaffold(options);

    assert.notCalled(gitScaffolder.scaffold);
    assert.notCalled(vcsHostScaffolder.default);
    assert.notCalled(dependencyUpdaterScaffolder.default);
  });

  test('that the language details get scaffolded', () => {
    const visibility = any.boolean();
    const ignore = any.simpleObject();
    const gitNextSteps = any.listOf(any.simpleObject);
    optionsValidator.validate.withArgs(options).returns({languages: scaffolders, vcsHosts});
    gitScaffolder.initialize.resolves(vcs);
    gitScaffolder.scaffold.resolves({nextSteps: gitNextSteps});
    prompts.promptForBaseDetails.resolves({
      [coreQuestionNames.PROJECT_NAME]: projectName,
      [coreQuestionNames.VISIBILITY]: visibility,
      [questionNames.GIT_REPO]: true,
      [coreQuestionNames.LICENSE]: license,
      [coreQuestionNames.DESCRIPTION]: description
    });
    prompts.promptForLanguageDetails
      .withArgs(scaffolders)
      .resolves({[questionNames.PROJECT_LANGUAGE]: projectLanguage});
    prompts.promptForVcsHostDetails.resolves({
      [questionNames.REPO_HOST]: repoHost,
      [questionNames.REPO_OWNER]: repoOwner
    });
    const languageConsumerBadges = any.simpleObject();
    const languageContributionBadges = any.simpleObject();
    const languageStatusBadges = any.simpleObject();
    const languageNextSteps = any.listOf(any.simpleObject);
    const verificationCommand = any.string();
    languageScaffolder.scaffold
      .withArgs(scaffolders, projectLanguage, {
        projectName,
        projectRoot: projectPath,
        visibility,
        license,
        vcs,
        description
      })
      .resolves({
        vcsIgnore: ignore,
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
    vcsHostScaffolder.default
      .withArgs(
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
      )
      .resolves(vcsOriginDetails);
    const execaPipe = sinon.spy();
    execa.default.withArgs(verificationCommand, {shell: true}).returns({stdout: {pipe: execaPipe}});

    return scaffold(options).then(() => {
      assert.calledWith(gitScaffolder.scaffold, {projectRoot: projectPath, ignore, origin: vcsOriginDetails});
      assert.calledWith(
        readmeScaffolder.default,
        {
          projectName,
          projectRoot: projectPath,
          description,
          documentation,
          badges: {
            consumer: languageConsumerBadges,
            status: languageStatusBadges,
            contribution: languageContributionBadges
          }
        }
      );
      assert.calledWith(execaPipe, process.stdout);
      assert.calledWith(resultsReporter.reportResults, {nextSteps: [...gitNextSteps, ...languageNextSteps]});
    });
  });

  test('that the language details are optional', () => {
    const visibility = any.boolean();
    optionsValidator.validate.withArgs(options).returns({languages: scaffolders, vcsHosts});
    gitScaffolder.initialize.resolves(vcs);
    prompts.promptForBaseDetails.resolves({
      [coreQuestionNames.PROJECT_NAME]: projectName,
      [coreQuestionNames.VISIBILITY]: visibility,
      [questionNames.GIT_REPO]: true,
      [coreQuestionNames.LICENSE]: license,
      [coreQuestionNames.DESCRIPTION]: description
    });
    prompts.promptForLanguageDetails
      .withArgs(scaffolders)
      .resolves({[questionNames.PROJECT_LANGUAGE]: projectLanguage});
    prompts.promptForVcsHostDetails.resolves({
      [questionNames.REPO_HOST]: repoHost,
      [questionNames.REPO_OWNER]: repoOwner
    });
    languageScaffolder.scaffold.resolves({});

    return scaffold(options).then(() => {
      assert.calledWith(gitScaffolder.scaffold, {projectRoot: projectPath, ignore: undefined, origin: undefined});
      assert.calledWith(
        readmeScaffolder.default,
        {
          projectName,
          projectRoot: projectPath,
          description,
          documentation: undefined,
          badges: {consumer: {}, status: {}, contribution: {}}
        }
      );
      assert.notCalled(execa.default);
    });
  });

  test('that the license is passed to the language scaffolder as `UNLICENSED` when no license was chosen', () => {
    optionsValidator.validate.withArgs(options).returns({});
    prompts.promptForBaseDetails.resolves({});
    prompts.promptForLanguageDetails.resolves({[questionNames.PROJECT_LANGUAGE]: projectLanguage});
    gitScaffolder.initialize.resolves({});

    return scaffold(options).then(() => assert.calledWithMatch(
      languageScaffolder.scaffold,
      {},
      projectLanguage,
      {license: 'UNLICENSED'}
    ));
  });

  test('that running a verification command is not attempted when not provided', () => {
    optionsValidator.validate.withArgs(options).returns({});
    prompts.promptForBaseDetails.resolves({});
    prompts.promptForLanguageDetails.resolves({});
    gitScaffolder.initialize.resolves({});
    languageScaffolder.scaffold.resolves({badges: {}, projectDetails: {}});

    return scaffold(options).then(() => assert.notCalled(execa.default));
  });
});
