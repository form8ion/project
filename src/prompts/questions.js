import {questionsForBaseDetails} from '@form8ion/core';
import {prompt} from '@form8ion/overridable-prompts';

import {questionNames} from './question-names';

export function promptForBaseDetails(projectRoot, copyrightHolder, decisions) {
  return prompt([
    ...questionsForBaseDetails(decisions, projectRoot, copyrightHolder),
    {name: questionNames.GIT_REPO, type: 'confirm', default: true, message: 'Should a git repository be initialized?'}
  ], decisions);
}
