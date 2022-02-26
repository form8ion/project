import {questionNames as coreQuestionNames} from '@form8ion/core';
import {questionNames as projectScaffolderQuestionNames} from './prompts/question-names';

export * from './scaffolder';
export {default as lift} from './lift';
export const questionNames = {
  ...coreQuestionNames,
  ...projectScaffolderQuestionNames
};
