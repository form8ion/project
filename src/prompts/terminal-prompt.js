import {prompt} from '@form8ion/overridable-prompts';

export default function ({questions, decisions}) {
  return prompt(questions, decisions);
}
