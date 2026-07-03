import scaffoldChoiceFromOptions from '../plugins/choice-scaffolder.js';
import chooseCoverageService from './prompt.js';

export default async function scaffoldCoverageService({plugins, options}, {prompt}) {
  return scaffoldChoiceFromOptions({plugins, options}, {choicePrompt: chooseCoverageService({prompt})});
}
