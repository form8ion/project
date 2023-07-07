export default function ({visibility}) {
  if ('Public' === visibility) {
    return {
      badges: {
        contribution: {
          PRs: {
            text: 'PRs Welcome',
            link: 'https://makeapullrequest.com',
            img: 'https://img.shields.io/badge/PRs-welcome-brightgreen.svg'
          }
        }
      }
    };
  }

  return {};
}
