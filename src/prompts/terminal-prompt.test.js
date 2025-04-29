import {prompt as promptWithInquirer} from '@form8ion/overridable-prompts';

import {when} from 'vitest-when';
import {describe, it, vi, expect} from 'vitest';
import any from '@travi/any';

import prompt from './terminal-prompt.js';

vi.mock('@form8ion/overridable-prompts');

describe('terminal prompt', () => {
  it('should present the provided questions using inquirer', async () => {
    const questions = any.listOf(any.simpleObject);
    const decisions = any.simpleObject();
    const answers = any.simpleObject();
    when(promptWithInquirer).calledWith(questions, decisions).thenResolve(answers);

    expect(await prompt(decisions)({questions})).toEqual(answers);
  });
});
