import stubbedFs from 'mock-fs';
import {promises} from 'fs';
import {resolve} from 'path';
import {Before, After, When, setWorldConstructor} from 'cucumber';
import {World} from '../support/world';
import {scaffold} from '../../../../src';

setWorldConstructor(World);

Before(async () => {
  const projectTemplatePath = '../../../../templates';

  // work around for overly aggressive mock-fs, see:
  // https://github.com/tschaub/mock-fs/issues/213#issuecomment-347002795
  require('mock-stdin'); // eslint-disable-line import/no-extraneous-dependencies

  stubbedFs({
    templates: {
      'README.mustache': await promises.readFile(resolve(__dirname, projectTemplatePath, './README.mustache')),
      'editorconfig.txt': await promises.readFile(resolve(__dirname, projectTemplatePath, './editorconfig.txt'))
    }
  });
});

After(() => stubbedFs.restore());

When(/^the project is scaffolded$/, async function () {
  await scaffold({languages: {}, overrides: {}});
});
