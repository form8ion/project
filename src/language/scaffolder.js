import {questionNames} from '../prompts/question-names.js';
import promptForLanguageDetails from './prompt.js';

export default async function (languagePlugins, decisions, options) {
  const {[questionNames.PROJECT_LANGUAGE]: chosenLanguage} = await promptForLanguageDetails(languagePlugins, decisions);

  const plugin = languagePlugins[chosenLanguage];

  if (plugin) return plugin.scaffold(options);

  return undefined;
}
