import {questionNames as coreQuestionNames} from '@form8ion/core';

export const questionNames = {
  BASE_DETAILS: coreQuestionNames,
  GIT_REPOSITORY: {
    GIT_REPO: 'gitRepo'
  },
  REPOSITORY_HOST: {
    REPO_HOST: 'repoHost',
    REPO_OWNER: 'repoOwner'
  },
  PROJECT_LANGUAGE: {
    PROJECT_LANGUAGE: 'projectLanguage'
  },
  DEPENDENCY_UPDATER: {
    DEPENDENCY_UPDATER: 'dependencyUpdater'
  },
  CI_PROVIDER: {
    CI_PROVIDER: 'ciProvider'
  },
  COVERAGE_SERVICE: {
    COVERAGE_SERVICE: 'coverageService'
  }
};
