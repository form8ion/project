import {questionNames as coreQuestionNames} from '@form8ion/core';

import {BASE_DETAILS_PROMPT_ID} from './questions.js';
import {GIT_REPOSITORY_PROMPT_ID} from '../vcs/prompt.js';
import {PROJECT_LANGUAGE_PROMPT_ID} from '../language/prompt.js';
import {REPOSITORY_HOST_PROMPT_ID} from '../vcs/host/prompt.js';
import {DEPENDENCY_UPDATER_PROMPT_ID} from '../dependency-updater/prompt.js';
import {questionNames as projectScaffolderQuestionNames} from './question-names.js';

export const ids = {
  BASE_DETAILS: BASE_DETAILS_PROMPT_ID,
  GIT_REPOSITORY: GIT_REPOSITORY_PROMPT_ID,
  REPOSITORY_HOST: REPOSITORY_HOST_PROMPT_ID,
  PROJECT_LANGUAGE: PROJECT_LANGUAGE_PROMPT_ID,
  DEPENDENCY_UPDATER: DEPENDENCY_UPDATER_PROMPT_ID
};

export const questionNames = {
  ...coreQuestionNames,
  ...projectScaffolderQuestionNames
};
