import program from 'commander';
import {scaffold} from './lib/index.esm.js';

program
  .command('scaffold')
  .description('scaffold a new project')
  .action(() => scaffold({
    languages: {
      foo: options => (opts => ({
        projectDetails: {homepage: 'https://website.com'},
        tags: ['foo', 'bar', 'baz'],
        badges: {
          contribution: {
            badgeName: {
              text: 'Hover text for the badge',
              link: 'http://link-to-related-service.com',
              img: 'image to render as badge'
            }
          },
          status: {},
          consumer: {}
        },
        ...opts.vcs && {
          vcsIgnore: {
            files: ['foo.txt', 'bar.txt'],
            directories: ['build/', 'dependencies/']
          }
        },
        nextSteps: [{summary: 'something extra to do manually'}],
        verificationCommand: 'terminal command to run after scaffolding is complete'
      }))(options)
    },
    overrides: {copyrightHolder: 'John Smith'}
  }).catch(err => {
    console.error(err);
    process.exitCode = 1;
  }));
