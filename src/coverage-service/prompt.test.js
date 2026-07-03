import {describe, it, expect, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import chooseCoverageService, {COVERAGE_SERVICE_PROMPT_ID} from './prompt.js';
import {questionNames} from '../prompts/index.js';

const {COVERAGE_SERVICE} = questionNames.COVERAGE_SERVICE;

describe('overage-service-prompt', () => {
  it('should prompt for the service choice', async () => {
    const prompt = vi.fn();
    const chosenService = any.word();
    const answers = {...any.simpleObject(), [COVERAGE_SERVICE]: chosenService};
    const services = any.simpleObject();
    when(prompt).calledWith({
      id: COVERAGE_SERVICE_PROMPT_ID,
      questions: [{
        name: COVERAGE_SERVICE,
        type: 'list',
        message: 'Which coverage service do you want to use with this project?',
        choices: [...Object.keys(services), 'Other']
      }]
    }).thenResolve(answers);

    expect(await chooseCoverageService({prompt})(services)).toEqual(chosenService);
  });
});
