import {promises} from 'fs';
import spdxLicenseList from 'spdx-license-list/simple';
import spdxLicenseListWithContent from 'spdx-license-list/full';
import wrap from 'word-wrap';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import scaffoldLicense from '../../src/license';

suite('license', () => {
  let sandbox;
  const license = any.fromList(Array.from(spdxLicenseList));
  const year = any.word();
  const copyrightHolders = any.sentence();
  const copyright = {year, holder: copyrightHolders};
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(promises, 'writeFile');

    promises.writeFile.resolves();
  });

  teardown(() => sandbox.restore());

  test('that no license file is created when no license was chosen', async () => {
    await scaffoldLicense({});

    assert.notCalled(promises.writeFile);
  });

  test('that the contents for the chosen license are written to LICENSE', () => assert.becomes(
    scaffoldLicense({projectRoot, license, copyright, vcs: {}}),
    {}
  ).then(() => assert.calledWith(
    promises.writeFile,
    `${projectRoot}/LICENSE`,
    `${wrap(
      `${spdxLicenseListWithContent[license].licenseText}\n`
        .replace(/<\s*year\s*>/gm, year)
        .replace(/<copyright holders>/gm, copyrightHolders)
        .replace(/<(.+?)>/gm, ''),
      {width: 80, indent: ''}
    )}\n`
  )));

  test('that the contents for the MIT license are written to LICENSE, when chosen', () => assert.becomes(
    scaffoldLicense({projectRoot, license: 'MIT', copyright, vcs: {}}),
    {}
  ).then(() => assert.calledWith(
    promises.writeFile,
    `${projectRoot}/LICENSE`,
    `${wrap(
      spdxLicenseListWithContent.MIT.licenseText
        .replace(/<\s*year\s*>/gm, year)
        .replace(/<copyright holders>/gm, copyrightHolders)
        .replace(/<(.+?)>/gm, ''),
      {width: 80, indent: ''}
    )}\n`
  )));

  test('that badge information is returned if the vcs is hosted at github', () => {
    const vcs = {host: 'GitHub', owner: any.word(), name: any.word()};

    return assert.becomes(scaffoldLicense({projectRoot, license, copyright, vcs}), {
      badges: {
        consumer: {
          img: `https://img.shields.io/github/license/${vcs.owner}/${vcs.name}.svg`,
          text: `${license} license`,
          link: 'LICENSE'
        }
      }
    });
  });

  test('that badge information is not returned when no license was chosen', () => assert.becomes(
    scaffoldLicense({projectRoot, copyright, vcs: {host: 'GitHub'}}),
    {}
  ));

  test('that badge information is not returned if the vcs is hosted somewhere other than github', () => assert.becomes(
    scaffoldLicense({projectRoot, license, copyright, vcs: {host: any.simpleObject()}}),
    {}
  ));

  test('that badge information is not returned if the will not be versioned', () => assert.becomes(
    scaffoldLicense({projectRoot, license, copyright, vcs: undefined}),
    {}
  ));
});
