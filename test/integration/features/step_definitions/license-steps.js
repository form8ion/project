import {promises as fs} from 'node:fs';

import {Given} from '@cucumber/cucumber';
import any from '@travi/any';

Given('a license file exists', async function () {
  await fs.writeFile(`${this.projectRoot}/LICENSE`, any.string());
});

Given('no license file exists', async function () {
  return undefined;
});
