import path from 'path';
import fs from 'mz/fs';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as readmeScaffolder from '../../src/readme';
import * as gitScaffolder from '../../src/vcs/git';
import * as vcsHostScaffolder from '../../src/vcs/host';
import * as licenseScaffolder from '../../src/license';
import * as travisScaffolder from '../../src/ci/travis';
import * as languageScaffolder from '../../src/language-scaffolder';
import * as exec from '../../third-party-wrappers/exec-as-promised';
import * as prompts from '../../src/prompts';
import * as optionsValidator from '../../src/options-validator';
import {scaffold} from '../../src/scaffolder';

suite('project scaffolder', () => {
  let sandbox;
  const options = any.simpleObject();
  const projectPath = any.string();
  const projectName = any.string();
  const repoHost = any.word();
  const repoOwner = any.word();
  const description = any.string();
  const license = any.string();
  const projectType = any.word();
  const licenseBadge = any.url();
  const scaffolders = any.simpleObject();
  const vcs = {host: repoHost, owner: repoOwner, name: projectName};

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(process, 'cwd');
    sandbox.stub(prompts, 'prompt');
    sandbox.stub(optionsValidator, 'validate');
    sandbox.stub(readmeScaffolder, 'default');
    sandbox.stub(gitScaffolder, 'default');
    sandbox.stub(vcsHostScaffolder, 'default');
    sandbox.stub(licenseScaffolder, 'default');
    sandbox.stub(travisScaffolder, 'default');
    sandbox.stub(languageScaffolder, 'scaffold');
    sandbox.stub(fs, 'copyFile');
    sandbox.stub(exec, 'default');

    process.cwd.returns(projectPath);
    fs.copyFile.resolves();
    licenseScaffolder.default.resolves({});
    travisScaffolder.default.resolves({});
  });

  teardown(() => sandbox.restore());

  test('that project files are generated', () => {
    const travisBadge = any.url();
    const year = any.word();
    const holder = any.sentence();
    const copyright = {year, holder};
    const visibility = any.word();
    const overrides = any.simpleObject();
    optionsValidator.validate.withArgs(options).returns({languages: scaffolders, overrides});
    prompts.prompt.withArgs(projectPath, scaffolders, overrides).resolves({
      [prompts.questionNames.PROJECT_NAME]: projectName,
      [prompts.questionNames.PROJECT_TYPE]: projectType,
      [prompts.questionNames.GIT_REPO]: true,
      [prompts.questionNames.REPO_HOST]: repoHost,
      [prompts.questionNames.REPO_OWNER]: repoOwner,
      [prompts.questionNames.LICENSE]: license,
      [prompts.questionNames.DESCRIPTION]: description,
      [prompts.questionNames.COPYRIGHT_HOLDER]: holder,
      [prompts.questionNames.COPYRIGHT_YEAR]: year,
      [prompts.questionNames.VISIBILITY]: visibility,
      [prompts.questionNames.CI]: 'Travis'
    });
    readmeScaffolder.default.resolves();
    gitScaffolder.default.resolves();
    licenseScaffolder.default
      .withArgs({projectRoot: projectPath, license, copyright, vcs})
      .resolves({badge: licenseBadge});
    vcsHostScaffolder.default.withArgs({host: repoHost, projectRoot: projectPath, projectType, description}).resolves();
    travisScaffolder.default
      .withArgs({projectRoot: projectPath, projectType, vcs, visibility})
      .resolves({badge: travisBadge});

    return scaffold(options).then(() => {
      assert.calledWith(gitScaffolder.default, {projectRoot: projectPath});
      assert.calledWith(
        readmeScaffolder.default,
        {
          projectName,
          projectRoot: projectPath,
          description,
          badges: {consumer: {license: licenseBadge}, status: {ci: travisBadge}, contribution: {}}
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

  test('that the travis scaffolder is not run if travis was not chosen as the ci service', () => {
    optionsValidator.validate.withArgs(options).returns({});
    prompts.prompt.resolves({
      [prompts.questionNames.PROJECT_NAME]: projectName,
      [prompts.questionNames.PROJECT_TYPE]: projectType,
      [prompts.questionNames.GIT_REPO]: true,
      [prompts.questionNames.LICENSE]: license,
      [prompts.questionNames.DESCRIPTION]: description,
      [prompts.questionNames.CI]: any.word()
    });
    licenseScaffolder.default.resolves({badge: licenseBadge});

    return scaffold(options).then(() => {
      assert.notCalled(travisScaffolder.default);
      assert.calledWith(
        readmeScaffolder.default,
        {
          projectName,
          projectRoot: projectPath,
          description,
          badges: {consumer: {license: licenseBadge}, status: {}, contribution: {}}
        }
      );
    });
  });

  test('that the PRs-welcome badge is included for public projects', () => {
    optionsValidator.validate.withArgs(options).returns({});
    prompts.prompt.resolves({
      [prompts.questionNames.PROJECT_NAME]: projectName,
      [prompts.questionNames.LICENSE]: license,
      [prompts.questionNames.DESCRIPTION]: description,
      [prompts.questionNames.VISIBILITY]: 'Public'
    });

    return scaffold(options).then(() => {
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
      [prompts.questionNames.PROJECT_NAME]: projectName,
      [prompts.questionNames.LICENSE]: license,
      [prompts.questionNames.DESCRIPTION]: description,
      [prompts.questionNames.GIT_REPO]: false
    });
    readmeScaffolder.default.resolves();

    return scaffold(options).then(() => assert.calledWith(
      readmeScaffolder.default,
      {
        projectName,
        projectRoot: projectPath,
        description,
        badges: {consumer: {}, status: {}, contribution: {}}
      }
    ));
  });

  test('that the git repo is not initialized if not requested', () => {
    optionsValidator.validate.withArgs(options).returns({});
    prompts.prompt.resolves({[prompts.questionNames.GIT_REPO]: false});
    readmeScaffolder.default.resolves();

    return scaffold(options).then(() => assert.notCalled(gitScaffolder.default));
  });

  test('that the javascript project scaffolder is run for a js project', () => {
    const visibility = any.boolean();
    const ignore = any.simpleObject();
    const javascriptProjectType = 'JavaScript';
    const ci = any.word();
    optionsValidator.validate.withArgs(options).returns({languages: scaffolders});
    prompts.prompt.resolves({
      [prompts.questionNames.PROJECT_NAME]: projectName,
      [prompts.questionNames.PROJECT_TYPE]: javascriptProjectType,
      [prompts.questionNames.VISIBILITY]: visibility,
      [prompts.questionNames.GIT_REPO]: true,
      [prompts.questionNames.REPO_HOST]: repoHost,
      [prompts.questionNames.REPO_OWNER]: repoOwner,
      [prompts.questionNames.LICENSE]: license,
      [prompts.questionNames.CI]: ci,
      [prompts.questionNames.DESCRIPTION]: description
    });
    const jsConsumerBadges = any.simpleObject();
    const jsContibutionBadges = any.simpleObject();
    const verificationCommand = any.string();
    languageScaffolder.scaffold
      .withArgs(
        scaffolders,
        javascriptProjectType,
        {
          projectName,
          projectRoot: projectPath,
          visibility,
          license,
          vcs,
          ci,
          description
        }
      )
      .resolves({
        vcsIgnore: ignore,
        badges: {consumer: jsConsumerBadges, contribution: jsContibutionBadges},
        verificationCommand
      });
    vcsHostScaffolder.default
      .withArgs({
        host: repoHost,
        owner: repoOwner,
        projectName,
        projectRoot: projectPath,
        projectType: javascriptProjectType,
        description
      })
      .resolves(vcs);

    return scaffold(options).then(() => {
      assert.calledWith(gitScaffolder.default, {projectRoot: projectPath, ignore});
      assert.calledWith(
        readmeScaffolder.default,
        sinon.match({
          badges: {
            consumer: {...jsConsumerBadges, license: undefined},
            status: {ci: undefined},
            contribution: jsContibutionBadges
          }
        })
      );
      assert.calledWith(exec.default, verificationCommand, {silent: false});
    });
  });

  test('that the license is passed to the language scaffolder as `UNLICENSED` when no license was chosen', () => {
    optionsValidator.validate.withArgs(options).returns({});
    prompts.prompt.resolves({[prompts.questionNames.PROJECT_TYPE]: projectType});

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
    languageScaffolder.scaffold.resolves({badges: {}});

    return scaffold(options).then(() => assert.notCalled(exec.default));
  });
});
