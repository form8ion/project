function repositoryIsHostedOnGithub(vcs) {
  return vcs && 'github' === vcs.host;
}

export default function ({vcs}) {
  return {
    ...repositoryIsHostedOnGithub(vcs) && {
      badges: {
        consumer: {
          license: {
            link: 'LICENSE',
            img: `https://img.shields.io/github/license/${vcs.owner}/${vcs.name}.svg?logo=opensourceinitiative`,
            text: 'license'
          }
        }
      }
    }
  };
}
