import {questionNames} from '../../prompts/question-names.js';
import terminalPrompt from '../../prompts/terminal-prompt.js';
import promptForVcsHostDetails from './prompt.js';

export default async function (hosts, visibility, decisions, options) {
  const {
    [questionNames.REPO_HOST]: chosenHost,
    [questionNames.REPO_OWNER]: owner
  } = await promptForVcsHostDetails(hosts, visibility, decisions);

  const lowercasedHosts = Object.fromEntries(
    Object.entries(hosts).map(([name, details]) => [name.toLowerCase(), details])
  );
  const host = lowercasedHosts[chosenHost.toLowerCase()];

  if (host) return host.scaffold({...options, owner}, {prompt: terminalPrompt});

  return {vcs: {}};
}
