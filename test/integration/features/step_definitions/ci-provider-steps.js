import {directoryExists} from '@form8ion/core';

import {Given, Then} from '@cucumber/cucumber';
import {assert} from 'chai';
import any from '@travi/any';

import {ids, questionNames} from '../../../../src/prompts/index.js';
import {deriveHostMarkerDirectory} from './vcs/vcs-host-steps.js';

const {CI_PROVIDER} = questionNames.CI_PROVIDER;
const ciProviderPromptId = ids.CI_PROVIDER;

Given('CI providers can be chosen when they qualify', async function () {
  this.qualifiedCiProviderName = any.word();
  this.unqualifiedCiProviderName = any.word();
  this.qualifiedCiProviderScaffolderCalled = false;
  this.unqualifiedCiProviderScaffolderCalled = false;

  this.setAnswerFor(CI_PROVIDER, this.qualifiedCiProviderName);

  this.ciProviderPlugins = {
    [this.qualifiedCiProviderName]: {
      qualify: () => true,
      scaffold: options => {
        this.qualifiedCiProviderScaffolderCalled = true;

        assert.isDefined(options);

        return {};
      }
    },
    [this.unqualifiedCiProviderName]: {
      qualify: () => false,
      scaffold: options => {
        this.unqualifiedCiProviderScaffolderCalled = true;

        assert.isDefined(options);

        return {};
      }
    }
  };
});

Given('a CI provider without a qualify method can be chosen', async function () {
  this.noQualifyMethodCiProviderName = any.word();
  this.noQualifyMethodCiProviderScaffolderCalled = false;

  this.setAnswerFor(CI_PROVIDER, this.noQualifyMethodCiProviderName);

  this.ciProviderPlugins = {
    [this.noQualifyMethodCiProviderName]: {
      scaffold: options => {
        this.noQualifyMethodCiProviderScaffolderCalled = true;

        assert.isDefined(options);

        return {};
      }
    }
  };
});

Given('a host-aware CI provider can be chosen', async function () {
  this.hostAwareCiProviderName = any.word();
  this.hostAwareCiProviderScaffolderCalled = false;

  this.setAnswerFor(CI_PROVIDER, this.hostAwareCiProviderName);

  this.ciProviderPlugins = {
    [this.hostAwareCiProviderName]: {
      qualify: async qualificationContext => {
        this.ciProviderQualificationContext = qualificationContext;
        const markerDirectory = deriveHostMarkerDirectory(this.repoHost);

        this.ciProviderMarkerPathChecked = `${qualificationContext.projectRoot}/${markerDirectory}`;
        this.ciProviderMarkerExists = await directoryExists(this.ciProviderMarkerPathChecked);

        return this.ciProviderMarkerExists;
      },
      scaffold: options => {
        this.hostAwareCiProviderScaffolderCalled = true;

        assert.isDefined(options);

        return {};
      }
    }
  };
});

Then('only qualified CI providers are offered', async function () {
  const ciProviderPromptQuestions = this.promptQuestionsById?.[ciProviderPromptId];

  assert.isDefined(ciProviderPromptQuestions, 'Expected the CI provider prompt to be shown');
  assert.deepEqual(ciProviderPromptQuestions, [{
    name: CI_PROVIDER,
    type: 'list',
    message: 'Which CI service do you want use with this project?',
    choices: [this.qualifiedCiProviderName, 'Other']
  }]);
});

Then('the qualified CI provider is scaffolded', async function () {
  assert.isTrue(this.qualifiedCiProviderScaffolderCalled);
});

Then('the unqualified CI provider is not scaffolded', async function () {
  assert.isFalse(this.unqualifiedCiProviderScaffolderCalled);
});

Then('the CI provider without a qualify method is offered', async function () {
  const ciProviderPromptQuestions = this.promptQuestionsById?.[ciProviderPromptId];

  assert.isDefined(ciProviderPromptQuestions, 'Expected the CI provider prompt to be shown');
  assert.deepEqual(ciProviderPromptQuestions, [{
    name: CI_PROVIDER,
    type: 'list',
    message: 'Which CI service do you want use with this project?',
    choices: [this.noQualifyMethodCiProviderName, 'Other']
  }]);
});

Then('the CI provider without a qualify method is scaffolded', async function () {
  assert.isTrue(this.noQualifyMethodCiProviderScaffolderCalled);
});

Then('the CI provider is qualified using repository marker files', async function () {
  assert.isDefined(this.ciProviderQualificationContext, 'Expected CI provider qualification to be attempted');
  assert.equal(this.ciProviderQualificationContext.projectRoot, this.projectRoot);
  assert.equal(this.ciProviderMarkerPathChecked, `${this.projectRoot}/${this.vcsHostMarkerDirectory}`);
  assert.isTrue(this.ciProviderMarkerExists);
});

Then('the host-aware CI provider is scaffolded', async function () {
  assert.isTrue(this.hostAwareCiProviderScaffolderCalled);
});
