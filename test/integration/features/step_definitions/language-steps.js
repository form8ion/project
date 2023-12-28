import {Given} from '@cucumber/cucumber';
import any from '@travi/any';

import {questionNames} from '../../../../src/prompts/question-names.js';

function generateFullBadge() {
  return {
    text: any.word(),
    link: any.url(),
    img: any.url()
  };
}

function generateBadgeWithNoLink() {
  return {
    text: any.word(),
    img: any.url()
  };
}

Given('a language scaffolder is chosen', async function () {
  this.setAnswerFor(questionNames.PROJECT_LANGUAGE, any.word());
  this.vcsIgnoreDirectories = any.listOf(any.word, {min: 1});
  this.vcsIgnoreFiles = any.listOf(any.word, {min: 1});

  this.languageScaffolderResults = {
    badges: {
      status: {
        [any.word()]: generateFullBadge(),
        [any.word()]: generateBadgeWithNoLink()
      },
      consumer: {
        [any.word()]: generateFullBadge(),
        [any.word()]: generateBadgeWithNoLink()
      },
      contribution: {
        [any.word()]: generateFullBadge(),
        [any.word()]: generateBadgeWithNoLink()
      }
    },
    vcsIgnore: {
      directories: this.vcsIgnoreDirectories,
      files: this.vcsIgnoreFiles
    }
  };
});
