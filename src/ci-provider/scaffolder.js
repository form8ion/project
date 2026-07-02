import scaffoldChoiceFromOptions from '../plugins/choice-scaffolder.js';
import chooseCiProvider from './prompt.js';

export default async function scaffoldCiProvider({plugins, options}, {prompt}) {
  return scaffoldChoiceFromOptions({plugins, options}, {choicePrompt: chooseCiProvider({prompt})});
}
