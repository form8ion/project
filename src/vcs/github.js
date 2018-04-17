import writeYaml from '../../../../third-party-wrappers/write-yaml';

export default function scaffoldGithub({projectRoot, projectType, description}) {
  return writeYaml(`${projectRoot}/.github/settings.yml`, {
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
      {name: 'wontfix', color: 'ffffff'},
      ('JavaScript' === projectType) ? {name: 'greenkeeper', color: '00c775'} : undefined
    ].filter(Boolean)
  });
}
