import {Given, Then} from '@cucumber/cucumber';
import any from '@travi/any';
import {assert} from 'chai';
import {questionNames} from '../../../../src/prompts/index.js';

const {COVERAGE_SERVICE} = questionNames.COVERAGE_SERVICE;

Given('coverage services can be chosen when they qualify', async function () {
  this.qualifiedCoverageServiceName = any.word();
  this.unqualifiedCoverageServiceName = any.word();
  this.qualifiedCoverageServiceScaffolderCalled = false;
  this.unqualifiedCoverageServiceScaffolderCalled = false;

  this.setAnswerFor(COVERAGE_SERVICE, this.qualifiedCoverageServiceName);

  this.coverageServicePlugins = {
    [this.qualifiedCoverageServiceName]: {
      qualify: () => true,
      scaffold: options => {
        this.qualifiedCoverageServiceScaffolderCalled = true;

        assert.isDefined(options);

        return {};
      }
    },
    [this.unqualifiedCoverageServiceName]: {
      qualify: () => false,
      scaffold: options => {
        this.unqualifiedCoverageServiceScaffolderCalled = true;

        assert.isDefined(options);

        return {};
      }
    }
  };
});

Then('the chosen coverage service is configured', async function () {
  assert.isTrue(this.qualifiedCoverageServiceScaffolderCalled);
});
