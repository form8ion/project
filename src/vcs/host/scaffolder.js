import promptForVcsHostDetails from './prompt.js';
import {questionNames} from '../../prompts/question-names.js';

export default async function (hosts, visibility, decisions, options) {
  const {
    [questionNames.REPO_HOST]: chosenHost,
    [questionNames.REPO_OWNER]: owner
  } = await promptForVcsHostDetails(hosts, visibility, decisions);

  const lowercasedHosts = Object.fromEntries(
    Object.entries(hosts).map(([name, details]) => [name.toLowerCase(), details])
  );
  const host = lowercasedHosts[chosenHost.toLowerCase()];

  if (host) return host.scaffold({...options, owner});

  return {vcs: {}};
}
