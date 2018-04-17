import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import * as yamlWriter from '../../../../../third-party-wrappers/write-yaml';
import scaffoldGithub from '../../../src/vcs/github';

suite('github', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(yamlWriter, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the settings file is produced', () => {
    const description = any.sentence();
    yamlWriter.default.resolves();

    return scaffoldGithub({projectRoot, description}).then(() => assert.calledWith(
      yamlWriter.default,
      `${projectRoot}/.github/settings.yml`,
      {
        repository: {
          description,
          has_wiki: false,
          has_projects: false,
          has_downloads: false,
          allow_squash_merge: false,
          allow_merge_commit: true,
          allow_rebase_merge: true
        },
        labels: [
          {name: 'bug', color: 'ee0701'},
          {name: 'duplicate', color: 'cccccc'},
          {name: 'enhancement', color: '84b6eb'},
          {name: 'help wanted', color: '128A0C'},
          {name: 'invalid', color: 'e6e6e6'},
          {name: 'question', color: 'cc317c'},
          {name: 'wontfix', color: 'ffffff'}
        ]
      }
    ));
  });

  test('that the greenkeeper label is defined for javascript projects', () => {
    yamlWriter.default.resolves();

    return scaffoldGithub({projectRoot, projectType: 'JavaScript'}).then(() => assert.calledWith(
      yamlWriter.default,
      `${projectRoot}/.github/settings.yml`,
      sinon.match({
        labels: [
          {name: 'bug', color: 'ee0701'},
          {name: 'duplicate', color: 'cccccc'},
          {name: 'enhancement', color: '84b6eb'},
          {name: 'help wanted', color: '128A0C'},
          {name: 'invalid', color: 'e6e6e6'},
          {name: 'question', color: 'cc317c'},
          {name: 'wontfix', color: 'ffffff'},
          {name: 'greenkeeper', color: '00c775'}
        ]
      })
    ));
  });
});
