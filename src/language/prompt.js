import {prompt, Separator} from '@form8ion/overridable-prompts';

import {questionNames} from '../prompts/question-names.js';

export default function (languages, decisions) {
  return prompt([{
    name: questionNames.PROJECT_LANGUAGE,
    type: 'list',
    message: 'What type of project is this?',
    choices: [...Object.keys(languages), new Separator(), 'Other']
  }], decisions);
}
