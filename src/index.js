import {questionNames as coreQuestionNames} from '@form8ion/core';
import {questionNames as projectScaffolderQuestionNames} from './prompts/question-names.js';

export * from './scaffolder.js';
export const questionNames = {
  ...coreQuestionNames,
  ...projectScaffolderQuestionNames
};
