import {prompt} from '@form8ion/overridable-prompts';

export default function (decisions) {
  return ({questions}) => prompt(questions, decisions);
}
