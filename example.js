import program from 'commander';
import {scaffold as scaffoldJavaScript} from '@travi/javascript-scaffolder';
import {scaffold} from './lib/index.cjs';

program
  .command('scaffold')
  .description('scaffold a new project')
  .action(() => scaffold({
    languages: {
      JavaScript: options => scaffoldJavaScript(options)
    },
    overrides: {copyrightHolder: 'John Smith'}
  }).catch(err => {
    console.error(err);
    process.exitCode = 1;
  }));
