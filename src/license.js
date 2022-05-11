import {promises} from 'fs';
import wrap from 'word-wrap';
import mustache from 'mustache';
// eslint-disable-next-line import/extensions
import spdxLicenseList from 'spdx-license-list/full.js';
import {info} from '@travi/cli-messages';

export default async function ({projectRoot, license, copyright, vcs}) {
  if (license) {
    info('Generating License');

    let licenseContent = spdxLicenseList[license].licenseText;

    if ('MIT' === license) {
      licenseContent = licenseContent.replace('(including the next paragraph) ', '');
    }

    await promises.writeFile(
      `${projectRoot}/LICENSE`,
      `${wrap(
        mustache.render(licenseContent, {year: copyright.year, 'copyright holders': copyright.holder}, {}, ['<', '>']),
        {width: 80, indent: ''}
      )}\n`
    );

    return {
      ...vcs && 'github' === vcs.host && {
        badges: {
          consumer: {
            license: {
              img: `https://img.shields.io/github/license/${vcs.owner}/${vcs.name}.svg`,
              text: `${license} license`,
              link: 'LICENSE'
            }
          }
        }
      }
    };
  }

  return {};
}
