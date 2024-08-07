import {promises as fs} from 'fs';
import wrap from 'word-wrap';
import mustache from 'mustache';
// eslint-disable-next-line import/extensions
import spdxLicenseList from 'spdx-license-list/full.js';
import {info} from '@travi/cli-messages';

export default async function ({projectRoot, license, copyright}) {
  if (license) {
    info('Generating License');

    const licenseContent = spdxLicenseList[license].licenseText;

    await fs.writeFile(
      `${projectRoot}/LICENSE`,
      `${wrap(
        mustache.render(licenseContent, {year: copyright.year, 'copyright holders': copyright.holder}, {}, ['<', '>']),
        {width: 80, indent: ''}
      )}\n`
    );
  }

  return {};
}
