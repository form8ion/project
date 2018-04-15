import fs from 'mz/fs';
import chalk from 'chalk';
import mustache from 'mustache';
import spdxLicenseList from 'spdx-license-list/full';

export default async function ({projectRoot, license, copyright, vcs}) {
  if (license) {
    console.log(chalk.blue('Generating License'));     // eslint-disable-line no-console

    const licenseContent = `${spdxLicenseList[license].licenseText}\n`.replace(/\n/gm, '\n\n');
    mustache.parse(licenseContent, ['<', '>']);

    await fs.writeFile(
      `${projectRoot}/LICENSE`,
      mustache.render(licenseContent, {year: copyright.year, 'copyright holders': copyright.holder})
    );

    return {
      ...(vcs && 'GitHub' === vcs.host) && {
        badge: {
          img: `https://img.shields.io/github/license/${vcs.owner}/${vcs.name}.svg`,
          text: `${license} license`,
          link: 'LICENSE'
        }
      }
    };
  }

  return {};
}
