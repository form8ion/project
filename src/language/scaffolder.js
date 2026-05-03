import {questionNames} from '../prompts/question-names.js';
import promptForLanguageDetails from './prompt.js';

const {PROJECT_LANGUAGE} = questionNames.PROJECT_LANGUAGE;

export default async function scaffoldLanguage(languagePlugins, options, {prompt}) {
  const {[PROJECT_LANGUAGE]: chosenLanguage} = await promptForLanguageDetails(languagePlugins, {prompt});

  const plugin = languagePlugins[chosenLanguage];

  if (plugin) return plugin.scaffold(options);

  return undefined;
}
