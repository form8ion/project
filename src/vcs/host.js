export default function (hosts, options) {
  const {host: chosenHost, ...rest} = options;
  const host = hosts[chosenHost];

  if (host) return host.scaffolder(rest);

  return {};
}
