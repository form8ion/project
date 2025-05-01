import {questionsForBaseDetails} from '@form8ion/core';
import {prompt} from '@form8ion/overridable-prompts';

export function promptForBaseDetails(projectRoot, decisions) {
  return prompt(questionsForBaseDetails(decisions, projectRoot), decisions);
}
