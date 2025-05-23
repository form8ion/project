import {questionNames} from '../../prompts/question-names.js';
import terminalPromptFactory from '../../prompts/terminal-prompt.js';
import promptForVcsHostDetails from './prompt.js';

export default async function scaffoldVcsHost(hosts, decisions, options) {
  const {[questionNames.REPO_HOST]: chosenHost} = await promptForVcsHostDetails(hosts, decisions);

  const lowercasedHosts = Object.fromEntries(
    Object.entries(hosts).map(([name, details]) => [name.toLowerCase(), details])
  );
  const host = lowercasedHosts[chosenHost.toLowerCase()];

  if (host) return host.scaffold(options, {prompt: terminalPromptFactory(decisions)});

  return {vcs: {}};
}
