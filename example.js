import program from 'commander';
import {scaffold as scaffoldTravisForJavaScript} from '@travi/travis-scaffolder-javascript';
import {scaffold as scaffoldJavaScript} from '@travi/javascript-scaffolder';
import {scaffold} from './lib/index.cjs';

program
  .command('scaffold')
  .description('scaffold a new project')
  .action(() => scaffold({
    languages: {
      JavaScript: options => scaffoldJavaScript({
        ...options,
        configs: {
          eslint: {scope: '@form8ion'},
          remark: '@form8ion/remark-lint-preset',
          babelPreset: {name: '@form8ion', packageName: '@form8ion/babel-preset'},
          commitlint: {name: '@form8ion', packageName: '@form8ion/commitlint-config'}
        },
        overrides: {npmAccount: 'form8ion'},
        ciServices: {Travis: {scaffolder: scaffoldTravisForJavaScript, public: true}}
      })
    },
    overrides: {copyrightHolder: 'John Smith'}
  }).catch(err => {
    console.error(err);
    process.exitCode = 1;
  }));
