import {questionNames} from '../prompts/question-names.js';

export const PROJECT_LANGUAGE_PROMPT_ID = 'PROJECT_LANGUAGE';

export default function promptForProjectLanguage(languages, {prompt}) {
  return prompt({
    id: PROJECT_LANGUAGE_PROMPT_ID,
    questions: [{
      name: questionNames.PROJECT_LANGUAGE,
      type: 'list',
      message: 'What type of project is this?',
      choices: [...Object.keys(languages), 'Other']
    }]
  });
}
