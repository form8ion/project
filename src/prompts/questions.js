import {questionsForBaseDetails} from '@form8ion/core';

export const BASE_DETAILS_PROMPT_ID = 'BASE_DETAILS';

export function promptForBaseDetails(projectRoot, {prompt}) {
  return prompt({
    id: BASE_DETAILS_PROMPT_ID,
    questions: questionsForBaseDetails(projectRoot)
  });
}
