import path from 'path';
import fs from 'mz/fs';
import * as javascriptScaffolder from '@travi/javascript-scaffolder';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as readmeScaffolder from '../../src/readme';
import * as gitScaffolder from '../../src/vcs/git';
import * as vcsHostScaffolder from '../../src/vcs/host';
import * as licenseScaffolder from '../../src/license';
import * as travisScaffolder from '../../src/ci/travis';
import * as exec from '../../../../third-party-wrappers/exec-as-promised';
import * as prompts from '../../src/prompts';
import scaffolder from '../../src/scaffolder';

suite('project scaffolder', () => {
  let sandbox;
  const projectPath = any.string();
  const projectName = any.string();
  const vcs = any.simpleObject();
  const repoHost = any.word();
  const description = any.string();
  const license = any.string();
  const projectType = any.word();
  const licenseBadge = any.url();

  setup(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(process, 'cwd');
    sandbox.stub(prompts, 'prompt');
    sandbox.stub(readmeScaffolder, 'default');
    sandbox.stub(gitScaffolder, 'default');
    sandbox.stub(vcsHostScaffolder, 'default');
    sandbox.stub(licenseScaffolder, 'default');
    sandbox.stub(javascriptScaffolder, 'scaffold');
    sandbox.stub(travisScaffolder, 'default');
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
    prompts.prompt.resolves({
      [prompts.questionNames.PROJECT_NAME]: projectName,
      [prompts.questionNames.PROJECT_TYPE]: projectType,
      [prompts.questionNames.GIT_REPO]: true,
      [prompts.questionNames.REPO_HOST]: repoHost,
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
    vcsHostScaffolder.default
      .withArgs({host: repoHost, projectName, projectRoot: projectPath, projectType})
      .resolves(vcs);
    travisScaffolder.default
      .withArgs({projectRoot: projectPath, projectType, vcs, visibility})
      .resolves({badge: travisBadge});

    return scaffolder().then(() => {
      assert.calledWith(gitScaffolder.default, {projectRoot: projectPath});
      assert.calledWith(
        readmeScaffolder.default,
        {
          projectName,
          projectRoot: projectPath,
          description,
          license,
          badges: {consumer: {license: licenseBadge}, status: {ci: travisBadge}, contribution: {}}
        }
      );
      assert.calledWith(
        fs.copyFile,
        path.resolve(__dirname, '../../', 'templates', 'editorconfig.txt'),
        `${projectPath}/.editorconfig`
      );
      assert.notCalled(javascriptScaffolder.scaffold);
    });
  });

  test('that the travis scaffolder is not run if travis was not chosen as the ci service', () => {
    prompts.prompt.resolves({
      [prompts.questionNames.PROJECT_NAME]: projectName,
      [prompts.questionNames.PROJECT_TYPE]: projectType,
      [prompts.questionNames.GIT_REPO]: true,
      [prompts.questionNames.LICENSE]: license,
      [prompts.questionNames.DESCRIPTION]: description,
      [prompts.questionNames.CI]: any.word()
    });
    licenseScaffolder.default.resolves({badge: licenseBadge});

    return scaffolder().then(() => {
      assert.notCalled(travisScaffolder.default);
      assert.calledWith(
        readmeScaffolder.default,
        {
          projectName,
          projectRoot: projectPath,
          description,
          license,
          badges: {consumer: {license: licenseBadge}, status: {}, contribution: {}}
        }
      );
    });
  });

  test('that the badge lists passed to the readme are empty if none are defined', () => {
    licenseScaffolder.default.resolves({});
    prompts.prompt.resolves({
      [prompts.questionNames.PROJECT_NAME]: projectName,
      [prompts.questionNames.LICENSE]: license,
      [prompts.questionNames.DESCRIPTION]: description,
      [prompts.questionNames.GIT_REPO]: false
    });
    readmeScaffolder.default.resolves();

    return scaffolder().then(() => assert.calledWith(
      readmeScaffolder.default,
      {
        projectName,
        projectRoot: projectPath,
        description,
        license,
        badges: {consumer: {}, status: {}, contribution: {}}
      }
    ));
  });

  test('that the git repo is not initialized if not requested', () => {
    prompts.prompt.resolves({
      [prompts.questionNames.GIT_REPO]: false
    });
    readmeScaffolder.default.resolves();

    return scaffolder().then(() => assert.notCalled(gitScaffolder.default));
  });

  test('that the javascript project scaffolder is run for a js project', () => {
    const visibility = any.boolean();
    const ignore = any.simpleObject();
    const javascriptProjectType = 'JavaScript';
    const ci = any.word();
    prompts.prompt.resolves({
      [prompts.questionNames.PROJECT_NAME]: projectName,
      [prompts.questionNames.PROJECT_TYPE]: javascriptProjectType,
      [prompts.questionNames.VISIBILITY]: visibility,
      [prompts.questionNames.REPO_HOST]: repoHost,
      [prompts.questionNames.GIT_REPO]: true,
      [prompts.questionNames.LICENSE]: license,
      [prompts.questionNames.CI]: ci
    });
    const jsConsumerBadges = any.simpleObject();
    const jsContibutionBadges = any.simpleObject();
    const verificationCommand = any.string();
    javascriptScaffolder.scaffold
      .withArgs({projectName, projectRoot: projectPath, visibility, license, vcs, ci})
      .resolves({
        vcsIgnore: ignore,
        badges: {consumer: jsConsumerBadges, contribution: jsContibutionBadges},
        verificationCommand
      });
    vcsHostScaffolder.default
      .withArgs({host: repoHost, projectName, projectRoot: projectPath, projectType: javascriptProjectType})
      .resolves(vcs);

    return scaffolder().then(() => {
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

  test('that running a verification command is not attempted when not provided', () => {
    prompts.prompt.resolves({[prompts.questionNames.PROJECT_TYPE]: 'JavaScript'});
    javascriptScaffolder.scaffold.resolves({badges: {}});

    return scaffolder().then(() => assert.notCalled(exec.default));
  });
});
