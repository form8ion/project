import {questionNames} from '../prompts/question-names.js';

export const CI_PROVIDER_PROMPT_ID = 'CI_PROVIDER';

const {CI_PROVIDER} = questionNames.CI_PROVIDER;

export default function promptForCiProvider(providers, {prompt}) {
  return prompt({
    id: CI_PROVIDER_PROMPT_ID,
    questions: [{
      name: CI_PROVIDER,
      type: 'list',
      message: 'Which CI service do you want use with this project?',
      choices: [...Object.keys(providers), 'Other']
    }]
  });
}
