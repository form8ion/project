# project-scaffolder

opinionated scaffolder for new projects

<!-- status badges -->
[![Build Status][ci-badge]][ci-link]
[![Codecov](https://img.shields.io/codecov/c/github/travi/project-scaffolder.svg)](https://codecov.io/github/travi/project-scaffolder)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


* [Usage](#usage)
  * [Installation](#installation)
  * [Consumption in a CLI tool](#consumption-in-a-cli-tool)
    * [Options](#options)
      * [`languages` (_optional_)](#languages-_optional_)
      * [`overrides` (_optional_)](#overrides-_optional_)
        * [`copyrightHolder`](#copyrightholder)
        * [`githubAccount`](#githubaccount)
* [Contributing](#contributing)
  * [Dependencies](#dependencies)
  * [Verification](#verification)
* [Related Projects](#related-projects)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

<!-- consumer badges -->
[![npm][npm-badge]][npm-link]
[![MIT license][license-badge]][license-link]

### Installation

```sh
$ npm install @travi/project-scaffolder -S
```

### Consumption in a CLI tool

This scaffolder is intended to be used as a CLI tool, but it is left up to the
consumer to provide the actual CLI wrapper. My [sub-command](https://github.com/travi/scaffolder-sub-command)
for [commander](https://www.npmjs.com/package/commander) is an example of such
a wrapper.

```js
import program from 'commander';
import {scaffold} from '@travi/project-scaffolder';

program
  .command('scaffold')
  .description('scaffold a new project')
  .action(() => scaffold().catch(err => {
    console.error(err);
    process.exitCode = 1;
  }));

```

#### Options

This is an opinionated scaffolder, but there are some aspects that are
configurable in order to support multiple contexts.

##### `languages` (_optional_)

provides the languages to choose from and the functions to perform the scaffolding
for the chosen language. if no languages are provided, `Other` will be the only
choice presented. Choosing `Other` will perform no language-specific scaffolding. 

__object__:

* keys: __string__ Name of the language
* values: __function__ that scaffolds language specific details
  * receives an options object as its first argument to pass along answers to
    the project-level prompts
    * `projectRoot`: __string__ path of the working directory where the CLI
      command was executed
    * `projectName`: __string__ name chosen for the project. defaults to the
      directory name.
    * `vcs`: __object__ details about the [VCS](https://en.wikipedia.org/wiki/Version_control)
      host
      * `host`: __string__ host name. defaults to `GitHub`
      * `name`: __string__ repository name. equal to `projectName`
      * `owner`: __string__ account name on the host service for the repository
        owner. defaults to `$ git config github.user` or the [overridden value](#githubaccount)
    * `visibility`: __string__ `Public` or `Private`. defaults to `Private`
    * `license`: __string__ identifier of the chosen [SPDX License](https://spdx.org/licenses/)
      or `UNLICENSED` 
    * `ci`: __string__ name of the chosen CI service. defaults to `Travis`
    * `description `: __string__ short summary of the project
    
##### `overrides` (_optional_)

###### `copyrightHolder`

__string__ enables setting the value of the prompt default for the copyright
holder. if not provided, the default will be empty.

###### `githubAccount` 

__string__ enables setting the GitHub account for the prompt default to define
the owner of scaffolded repositories. if not provided, the default will use the
result of `$ git config github.user`    

## Contributing

<!-- contribution badges -->
[![Conventional Commits][commit-convention-badge]][commit-convention-link]
[![Commitizen friendly][commitizen-badge]][commitizen-link]
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Greenkeeper badge](https://badges.greenkeeper.io/travi/project-scaffolder.svg)](https://greenkeeper.io/)
[![PRs Welcome][PRs-badge]][PRs-link]

### Dependencies

```sh
$ nvm install
$ npm install
```

### Verification

```sh
$ npm test
```

## Related Projects

* [javascript-scaffolder](https://npm.im/@travi/javascript-scaffolder)
* [scaffolder-sub-command](https://github.com/travi/scaffolder-sub-command)
* [cli](https://npm.im/@travi/cli)

[npm-link]: https://www.npmjs.com/package/@travi/project-scaffolder
[npm-badge]: https://img.shields.io/npm/v/@travi/project-scaffolder.svg
[license-link]: LICENSE
[license-badge]: https://img.shields.io/github/license/travi/project-scaffolder.svg
[ci-link]: https://travis-ci.org/travi/project-scaffolder
[ci-badge]: https://img.shields.io/travis/travi/project-scaffolder.svg?branch=master
[commit-convention-link]: https://conventionalcommits.org
[commit-convention-badge]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[commitizen-link]: http://commitizen.github.io/cz-cli/
[commitizen-badge]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[PRs-link]: http://makeapullrequest.com
[PRs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
