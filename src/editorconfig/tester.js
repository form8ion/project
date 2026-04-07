import {fileExists} from '@form8ion/core';

export default function editorconfigInUse({projectRoot}) {
  return fileExists(`${projectRoot}/.editorconfig`);
}
