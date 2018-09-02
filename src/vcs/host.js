import scaffoldGithub from './github';

export default function (options) {
  const {host, ...rest} = options;

  if ('GitHub' === host) return scaffoldGithub(rest);

  return {};
}
