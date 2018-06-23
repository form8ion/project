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
  const documentation = any.simpleObject();
  const vcs = {host: repoHost, owner: repoOwner, name: projectName};

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(process, 'cwd');
    sandbox.stub(prompts, 'prompt');
    sandbox.stub(optionsValidator, 'validate');
    sandbox.stub(readmeScaffolder, 'default');
    sandbox.stub(gitScaffolder, 'initialize');
    sandbox.stub(gitScaffolder, 'scaffold');
    sandbox.stub(vcsHostScaffolder, 'default');
    sandbox.stub(licenseScaffolder, 'default');
    sandbox.stub(languageScaffolder, 'scaffold');
    sandbox.stub(fs, 'copyFile');
    sandbox.stub(exec, 'default');

    process.cwd.returns(projectPath);
    fs.copyFile.resolves();
    licenseScaffolder.default.resolves({});
  });

  teardown(() => sandbox.restore());

  test('that project files are generated', () => {
    const ciBadge = any.url();
    const year = any.word();
    const holder = any.sentence();
    const copyright = {year, holder};
    const visibility = any.word();
    const overrides = any.simpleObject();
    const vcsIgnore = any.simpleObject();
    optionsValidator.validate.withArgs(options).returns({languages: scaffolders, overrides});
    prompts.prompt.withArgs(projectPath, scaffolders, overrides).resolves({
      [questionNames.PROJECT_NAME]: projectName,
      [questionNames.PROJECT_TYPE]: projectType,
      [questionNames.GIT_REPO]: true,
      [questionNames.REPO_HOST]: repoHost,
      [questionNames.REPO_OWNER]: repoOwner,
      [questionNames.LICENSE]: license,
      [questionNames.DESCRIPTION]: description,
      [questionNames.COPYRIGHT_HOLDER]: holder,
      [questionNames.COPYRIGHT_YEAR]: year,
      [questionNames.VISIBILITY]: visibility,
      [questionNames.CI]: 'Travis'
    });
    readmeScaffolder.default.resolves();
    gitScaffolder.scaffold.resolves();
    licenseScaffolder.default
      .withArgs({projectRoot: projectPath, license, copyright, vcs})
      .resolves({badge: licenseBadge});
    vcsHostScaffolder.default.withArgs({host: repoHost, projectRoot: projectPath, projectType, description}).resolves();
    languageScaffolder.scaffold
      .resolves({badges: {status: {ci: ciBadge}}, vcsIgnore, projectDetails: {}, documentation});

    return scaffold(options).then(() => {
      assert.calledWith(gitScaffolder.initialize, projectPath);
      assert.calledWith(gitScaffolder.scaffold, {projectRoot: projectPath, ignore: vcsIgnore});
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
    });
  });

  test('that the options are optional', () => {
    optionsValidator.validate.returns({});
    prompts.prompt.withArgs(projectPath, {}, {}).resolves({});

    return scaffold();
  });

  test('that each option is optional', () => {
    const emptyOptions = {};
    optionsValidator.validate.withArgs(emptyOptions).returns({});
    prompts.prompt.withArgs(projectPath, {}, {}).resolves({});

    return scaffold(emptyOptions);
  });

  test('that the PRs-welcome badge is included for public projects', () => {
    optionsValidator.validate.withArgs(options).returns({});
    prompts.prompt.resolves({
      [questionNames.PROJECT_NAME]: projectName,
      [questionNames.LICENSE]: license,
      [questionNames.GIT_REPO]: true,
      [questionNames.DESCRIPTION]: description,
      [questionNames.VISIBILITY]: 'Public'
    });

    return scaffold(options).then(() => {
      assert.calledWith(gitScaffolder.scaffold, {projectRoot: projectPath});
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
    prompts.prompt.resolves({
      [questionNames.PROJECT_NAME]: projectName,
      [questionNames.LICENSE]: license,
      [questionNames.DESCRIPTION]: description,
      [questionNames.GIT_REPO]: false
    });
    readmeScaffolder.default.resolves();

    return scaffold(options).then(() => {
      assert.notCalled(gitScaffolder.initialize);
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

  test('that the git repo is not initialized if not requested', () => {
    optionsValidator.validate.withArgs(options).returns({});
    prompts.prompt.resolves({[questionNames.GIT_REPO]: false});
    readmeScaffolder.default.resolves();

    return scaffold(options).then(() => assert.notCalled(gitScaffolder.scaffold));
  });

  test('that the language details get scaffolded', () => {
    const visibility = any.boolean();
    const ignore = any.simpleObject();
    const language = any.word();
    const ci = any.word();
    optionsValidator.validate.withArgs(options).returns({languages: scaffolders});
    prompts.prompt.resolves({
      [questionNames.PROJECT_NAME]: projectName,
      [questionNames.PROJECT_TYPE]: language,
      [questionNames.VISIBILITY]: visibility,
      [questionNames.GIT_REPO]: true,
      [questionNames.REPO_HOST]: repoHost,
      [questionNames.REPO_OWNER]: repoOwner,
      [questionNames.LICENSE]: license,
      [questionNames.CI]: ci,
      [questionNames.DESCRIPTION]: description
    });
    const languageConsumerBadges = any.simpleObject();
    const languageContributionBadges = any.simpleObject();
    const languageStatusBadges = any.simpleObject();
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
        projectDetails: {homepage}
      });
    vcsHostScaffolder.default.resolves();

    return scaffold(options).then(() => {
      assert.calledWith(gitScaffolder.scaffold, {projectRoot: projectPath, ignore});
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
      assert.calledWith(vcsHostScaffolder.default, {
        host: repoHost,
        projectRoot: projectPath,
        projectType: language,
        description,
        homepage
      });
    });
  });

  test('that the license is passed to the language scaffolder as `UNLICENSED` when no license was chosen', () => {
    optionsValidator.validate.withArgs(options).returns({});
    prompts.prompt.resolves({[questionNames.PROJECT_TYPE]: projectType});

    return scaffold(options).then(() => assert.calledWithMatch(
      languageScaffolder.scaffold,
      {},
      projectType,
      {license: 'UNLICENSED'}
    ));
  });

  test('that running a verification command is not attempted when not provided', () => {
    optionsValidator.validate.withArgs(options).returns({});
    prompts.prompt.resolves({});
    languageScaffolder.scaffold.resolves({badges: {}, projectDetails: {}});

    return scaffold(options).then(() => assert.notCalled(exec.default));
  });
});
