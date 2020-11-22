import {questionNames as coreQuestionNames} from '@form8ion/core';
import {questionNames as projectScaffolderQuestionNames} from './prompts/question-names';

export * from './scaffolder';
export const questionNames = {
  ...coreQuestionNames,
  ...projectScaffolderQuestionNames
};
