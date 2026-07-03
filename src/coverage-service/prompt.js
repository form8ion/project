import {questionNames} from '../prompts/question-names.js';

export const COVERAGE_SERVICE_PROMPT_ID = 'COVERAGE_SERVICE';

const {COVERAGE_SERVICE} = questionNames.COVERAGE_SERVICE;

export default function chooseCoverageService({prompt}) {
  return async providers => {
    const {[COVERAGE_SERVICE]: provider} = await prompt({
      id: COVERAGE_SERVICE_PROMPT_ID,
      questions: [{
        name: COVERAGE_SERVICE,
        type: 'list',
        message: 'Which coverage service do you want to use with this project?',
        choices: [...Object.keys(providers), 'Other']
      }]
    });

    return provider;
  };
}
