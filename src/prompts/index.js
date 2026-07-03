import {BASE_DETAILS_PROMPT_ID} from './questions.js';
import {GIT_REPOSITORY_PROMPT_ID} from '../vcs/prompt.js';
import {PROJECT_LANGUAGE_PROMPT_ID} from '../language/prompt.js';
import {REPOSITORY_HOST_PROMPT_ID} from '../vcs/host/prompt.js';
import {DEPENDENCY_UPDATER_PROMPT_ID} from '../dependency-updater/prompt.js';
import {CI_PROVIDER_PROMPT_ID} from '../ci-provider/prompt.js';
import {questionNames} from './question-names.js';
import {COVERAGE_SERVICE_PROMPT_ID} from '../coverage-service/prompt.js';

export const ids = {
  BASE_DETAILS: BASE_DETAILS_PROMPT_ID,
  GIT_REPOSITORY: GIT_REPOSITORY_PROMPT_ID,
  REPOSITORY_HOST: REPOSITORY_HOST_PROMPT_ID,
  PROJECT_LANGUAGE: PROJECT_LANGUAGE_PROMPT_ID,
  DEPENDENCY_UPDATER: DEPENDENCY_UPDATER_PROMPT_ID,
  CI_PROVIDER: CI_PROVIDER_PROMPT_ID,
  COVERAGE_SERVICE: COVERAGE_SERVICE_PROMPT_ID
};

export {questionNames};

export const constants = {ids, questionNames};
