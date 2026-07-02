import {questionNames} from '../prompts/question-names.js';

export const CI_PROVIDER_PROMPT_ID = 'CI_PROVIDER';

const {CI_PROVIDER} = questionNames.CI_PROVIDER;

export default function chooseCiProvider({prompt}) {
  return async providers => {
    const {[CI_PROVIDER]: provider} = await prompt({
      id: CI_PROVIDER_PROMPT_ID,
      questions: [{
        name: CI_PROVIDER,
        type: 'list',
        message: 'Which CI service do you want to use with this project?',
        choices: [...Object.keys(providers), 'Other']
      }]
    });

    return provider;
  };
}
