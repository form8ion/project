import {describe, it, expect, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import promptForCiProvider, {CI_PROVIDER_PROMPT_ID} from './prompt.js';
import {questionNames} from '../prompts/index.js';

const {CI_PROVIDER} = questionNames.CI_PROVIDER;

describe('ci-provider-prompt', () => {
  it('should prompt for the provider choice', async () => {
    const prompt = vi.fn();
    const answers = any.simpleObject();
    const providers = any.simpleObject();
    when(prompt).calledWith({
      id: CI_PROVIDER_PROMPT_ID,
      questions: [{
        name: CI_PROVIDER,
        type: 'list',
        message: 'Which CI service do you want use with this project?',
        choices: [...Object.keys(providers), 'Other']
      }]
    }).thenResolve(answers);

    expect(await promptForCiProvider(providers, {prompt})).toEqual(answers);
  });
});
