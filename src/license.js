import {promises} from 'fs';
import wrap from 'word-wrap';
import mustache from 'mustache';
import spdxLicenseList from 'spdx-license-list/full';
import {info} from '@travi/cli-messages';

export default async function ({projectRoot, license, copyright, vcs}) {
  if (license) {
    info('Generating License');

    const licenseContent = spdxLicenseList[license].licenseText;

    await promises.writeFile(
      `${projectRoot}/LICENSE`,
      `${wrap(
        mustache.render(licenseContent, {year: copyright.year, 'copyright holders': copyright.holder}, {}, ['<', '>']),
        {width: 80, indent: ''}
      )}\n`
    );

    return {
      ...vcs && 'GitHub' === vcs.host && {
        badges: {
          consumer: {
            img: `https://img.shields.io/github/license/${vcs.owner}/${vcs.name}.svg`,
            text: `${license} license`,
            link: 'LICENSE'
          }
        }
      }
    };
  }

  return {};
}
