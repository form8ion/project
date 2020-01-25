import path from 'path';
import fs from 'mz/fs';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as readmeScaffolder from '../../src/readme';
import * as gitScaffolder from '../../src/vcs/git';
import * as vcsHostScaffolder from '../../src/vcs/host';
import * as licenseScaffolder from '../../src/license';
import * as languageScaffolder from '../../src/language-scaffolder';
import * as exec from '../../third-party-wrappers/exec-as-promised';
import * as prompts from '../../src/prompts/questions';
import * as optionsValidator from '../../src/options-validator';
import * as successOutput from '../../src/success-output';
import {scaffold} from '../../src/scaffolder';
import {questionNames} from '../../src/prompts/question-names';

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
  const projectType = any.word();
  const licenseBadge = any.url();
  const scaffolders = any.simpleObject();
  const vcsHosts = any.simpleObject();
  const documentation = any.simpleObject();
  const vcs = any.simpleObject();
  const vcsOriginDetails = any.simpleObject();

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
    sandbox.stub(fs, 'copyFile');
    sandbox.stub(exec, 'default');
    sandbox.stub(successOutput, 'default');

    process.cwd.returns(projectPath);
    fs.copyFile.resolves();
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
    const decisions = any.simpleObject();
    const gitNextSteps = any.listOf(any.simpleObject);
    optionsValidator.validate.withArgs(options).returns({languages: scaffolders, overrides, vcsHosts, decisions});
    prompts.promptForBaseDetails
      .withArgs(projectPath, overrides.copyrightHolder, decisions)
      .resolves({
        [questionNames.PROJECT_NAME]: projectName,
        [questionNames.GIT_REPO]: gitRepoShouldBeInitialized,
        [questionNames.LICENSE]: license,
        [questionNames.DESCRIPTION]: description,
        [questionNames.COPYRIGHT_HOLDER]: holder,
        [questionNames.COPYRIGHT_YEAR]: year,
        [questionNames.VISIBILITY]: visibility,
        [questionNames.CI]: 'Travis'
      });
    prompts.promptForLanguageDetails
      .withArgs(scaffolders, decisions)
      .resolves({[questionNames.PROJECT_TYPE]: projectType});
    readmeScaffolder.default.resolves();
    gitScaffolder.initialize
      .withArgs(gitRepoShouldBeInitialized, projectPath, projectName, vcsHosts, visibility, decisions)
      .resolves(vcs);
    gitScaffolder.scaffold.resolves({nextSteps: gitNextSteps});
    licenseScaffolder.default
      .withArgs({projectRoot: projectPath, license, copyright, vcs})
      .resolves({badges: {consumer: licenseBadge}});
    vcsHostScaffolder.default
      .withArgs(vcsHosts, {...vcs, projectRoot: projectPath, projectType, description, visibility, homepage: undefined})
      .resolves(vcsOriginDetails);
    languageScaffolder.scaffold
      .resolves({badges: {status: {ci: ciBadge}}, vcsIgnore, projectDetails: {}, documentation});

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
        badges: {consumer: {license: licenseBadge}, status: {ci: ciBadge}, contribution: {}}
      }
    );
    assert.calledWith(
      fs.copyFile,
      path.resolve(__dirname, '../../', 'templates', 'editorconfig.txt'),
      `${projectPath}/.editorconfig`
    );
    assert.calledWith(successOutput.default, [...gitNextSteps]);
  });

  test('that the options are optional', async () => {
    const gitRepoShouldBeInitialized = any.boolean();
    optionsValidator.validate.returns({});
    prompts.promptForBaseDetails
      .withArgs(projectPath, undefined)
      .resolves({[questionNames.PROJECT_NAME]: projectName, [questionNames.GIT_REPO]: gitRepoShouldBeInitialized});
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
      [questionNames.PROJECT_NAME]: projectName,
      [questionNames.LICENSE]: license,
      [questionNames.GIT_REPO]: true,
      [questionNames.DESCRIPTION]: description,
      [questionNames.VISIBILITY]: 'Public'
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
      [questionNames.PROJECT_NAME]: projectName,
      [questionNames.LICENSE]: license,
      [questionNames.DESCRIPTION]: description,
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
  });

  test('that the language details get scaffolded', () => {
    const visibility = any.boolean();
    const ignore = any.simpleObject();
    const language = any.word();
    const ci = any.word();
    const gitNextSteps = any.listOf(any.simpleObject);
    optionsValidator.validate.withArgs(options).returns({languages: scaffolders, vcsHosts});
    gitScaffolder.initialize.resolves(vcs);
    gitScaffolder.scaffold.resolves({nextSteps: gitNextSteps});
    prompts.promptForBaseDetails.resolves({
      [questionNames.PROJECT_NAME]: projectName,
      [questionNames.VISIBILITY]: visibility,
      [questionNames.GIT_REPO]: true,
      [questionNames.LICENSE]: license,
      [questionNames.CI]: ci,
      [questionNames.DESCRIPTION]: description
    });
    prompts.promptForLanguageDetails.withArgs(scaffolders).resolves({[questionNames.PROJECT_TYPE]: language});
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
      .withArgs(scaffolders, language, {
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
        nextSteps: languageNextSteps
      });
    vcsHostScaffolder.default
      .withArgs(vcsHosts, {...vcs, projectRoot: projectPath, projectType: language, description, homepage, visibility})
      .resolves(vcsOriginDetails);

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
      assert.calledWith(exec.default, verificationCommand, {silent: false});
      assert.calledWith(successOutput.default, [...gitNextSteps, ...languageNextSteps]);
    });
  });

  test('that the language details are optional', () => {
    const visibility = any.boolean();
    const language = any.word();
    const ci = any.word();
    optionsValidator.validate.withArgs(options).returns({languages: scaffolders, vcsHosts});
    gitScaffolder.initialize.resolves(vcs);
    prompts.promptForBaseDetails.resolves({
      [questionNames.PROJECT_NAME]: projectName,
      [questionNames.VISIBILITY]: visibility,
      [questionNames.GIT_REPO]: true,
      [questionNames.LICENSE]: license,
      [questionNames.CI]: ci,
      [questionNames.DESCRIPTION]: description
    });
    prompts.promptForLanguageDetails.withArgs(scaffolders).resolves({[questionNames.PROJECT_TYPE]: language});
    prompts.promptForVcsHostDetails.resolves({
      [questionNames.REPO_HOST]: repoHost,
      [questionNames.REPO_OWNER]: repoOwner
    });
    languageScaffolder.scaffold.resolves({});
    vcsHostScaffolder.default
      .withArgs(vcsHosts, {...vcs, projectRoot: projectPath, projectType: language, description, homepage, visibility})
      .resolves(vcsOriginDetails);

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
      assert.notCalled(exec.default);
    });
  });

  test('that the license is passed to the language scaffolder as `UNLICENSED` when no license was chosen', () => {
    optionsValidator.validate.withArgs(options).returns({});
    prompts.promptForBaseDetails.resolves({});
    prompts.promptForLanguageDetails.resolves({[questionNames.PROJECT_TYPE]: projectType});
    gitScaffolder.initialize.resolves({});

    return scaffold(options).then(() => assert.calledWithMatch(
      languageScaffolder.scaffold,
      {},
      projectType,
      {license: 'UNLICENSED'}
    ));
  });

  test('that running a verification command is not attempted when not provided', () => {
    optionsValidator.validate.withArgs(options).returns({});
    prompts.promptForBaseDetails.resolves({});
    prompts.promptForLanguageDetails.resolves({});
    gitScaffolder.initialize.resolves({});
    languageScaffolder.scaffold.resolves({badges: {}, projectDetails: {}});

    return scaffold(options).then(() => assert.notCalled(exec.default));
  });
});
