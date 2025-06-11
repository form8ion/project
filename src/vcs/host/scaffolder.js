import {questionNames} from '../../prompts/question-names.js';
import promptForVcsHostDetails from './prompt.js';

export default async function scaffoldVcsHost(hosts, options, {prompt}) {
  const {[questionNames.REPO_HOST]: chosenHost} = await promptForVcsHostDetails(hosts, {prompt});

  const lowercasedHosts = Object.fromEntries(
    Object.entries(hosts).map(([name, details]) => [name.toLowerCase(), details])
  );
  const host = lowercasedHosts[chosenHost.toLowerCase()];

  if (host) return host.scaffold(options);

  return {vcs: {}};
}
