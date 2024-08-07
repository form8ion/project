import {promises as fs} from 'fs';
import wrap from 'word-wrap';
import spdxLicenseListWithContent from 'spdx-license-list/full';
import spdxLicenseList from 'spdx-license-list/simple';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';

import scaffoldLicense from './scaffolder.js';

vi.mock('fs');

describe('license', () => {
  const license = any.fromList(Array.from(spdxLicenseList));
  const year = any.word();
  const copyrightHolders = any.sentence();
  const copyright = {year, holder: copyrightHolders};
  const projectRoot = any.string();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not generate a license file when no license was chosen', async () => {
    await scaffoldLicense({});

    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should write the contents for the chosen license to LICENSE', async () => {
    expect(await scaffoldLicense({projectRoot, license, copyright, vcs: {}})).toEqual({});

    expect(fs.writeFile).toHaveBeenCalledWith(
      `${projectRoot}/LICENSE`,
      `${wrap(
        `${spdxLicenseListWithContent[license].licenseText}\n`
          .replace(/<\s*year\s*>/gm, year)
          .replace(/<copyright holders>/gm, copyrightHolders)
          .replace(/<(.+?)>/gm, ''),
        {width: 80, indent: ''}
      )}\n`
    );
  });

  it('should write the common version of the MIT license to LICENSE, when chosen', async () => {
    expect(await scaffoldLicense({projectRoot, license: 'MIT', copyright, vcs: {}})).toEqual({});

    expect(fs.writeFile).toHaveBeenCalledWith(
      `${projectRoot}/LICENSE`,
      `${wrap(
        spdxLicenseListWithContent.MIT.licenseText
          .replace('(including the next paragraph) ', '')
          .replace(/<\s*year\s*>/gm, year)
          .replace(/<copyright holders>/gm, copyrightHolders)
          .replace(/<(.+?)>/gm, ''),
        {width: 80, indent: ''}
      )}\n`
    );
  });
});
