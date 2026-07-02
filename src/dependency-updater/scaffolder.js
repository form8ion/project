import chooseDependencyUpdater from './prompt.js';
import scaffoldChoiceFromOptions from '../plugins/choice-scaffolder.js';

export default async function scaffoldDependencyUpdater({plugins, options}, {prompt}) {
  return scaffoldChoiceFromOptions({plugins, options}, {choicePrompt: chooseDependencyUpdater({prompt})});
}
