import {fileExists} from '@form8ion/core';

export default function licenseDefined({projectRoot}) {
  return fileExists(`${projectRoot}/LICENSE`);
}
