import {questionNames} from '../prompts/question-names.js';
import promptForLanguageDetails from './prompt.js';

export default async function (languagePlugins, options, {prompt}) {
  const {[questionNames.PROJECT_LANGUAGE]: chosenLanguage} = await promptForLanguageDetails(languagePlugins, {prompt});

  const plugin = languagePlugins[chosenLanguage];

  if (plugin) return plugin.scaffold(options);

  return undefined;
}
