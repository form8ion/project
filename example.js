// remark-usage-ignore-next 5
import program from 'commander';
import {scaffold} from './lib/index.cjs';

function scaffoldJavaScript() {}
function scaffoldPython() {}

program
  .command('scaffold')
  .description('scaffold a new project')
  .action(() => scaffold({
    languages: {
      JavaScript: options => scaffoldJavaScript(options),
      Python: options => scaffoldPython(options)
    },
    overrides: {copyrightHolder: 'John Smith'}
  }).catch(err => {
    console.error(err);
    process.exitCode = 1;
  }));
