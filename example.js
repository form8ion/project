import program from 'commander';
import {scaffold} from './lib/index.cjs';

program
  .command('scaffold')
  .description('scaffold a new project')
  .action(() => scaffold().catch(err => {
    console.error(err);
    process.exitCode = 1;
  }));
