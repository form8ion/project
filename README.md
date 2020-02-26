# project-scaffolder

opinionated scaffolder for new projects

<!-- status badges -->

[![Build Status][ci-badge]][ci-link]
[![Codecov](https://img.shields.io/codecov/c/github/travi/project-scaffolder.svg)](https://codecov.io/github/travi/project-scaffolder)

## Table of Contents

* [Features](#features)
* [Usage](#usage)
  * [Installation](#installation)
  * [Consumption in a CLI tool](#consumption-in-a-cli-tool)
    * [Example](#example)
    * [Options](#options)
      * [`languages` (_optional_)](#languages-optional)
      * [`vcsHosts` (_optional_)](#vcshosts-optional)
      * [`overrides` (_optional_)](#overrides-optional)
        * [`copyrightHolder`](#copyrightholder)
        * [`githubAccount`](#githubaccount)
* [Contributing](#contributing)
  * [Dependencies](#dependencies)
  * [Verification](#verification)
* [Related Projects](#related-projects)
* [Inspiration](#inspiration)

## Features

* configures generic editor settings through [EditorConfig](http://editorconfig.org/)
* scaffolds [license](https://spdx.org/licenses/) details
* scaffolds [VCS](https://en.wikipedia.org/wiki/VCS) details if [git](https://git-scm.com/)
  is chosen
* scaffolds the [VCS](https://en.wikipedia.org/wiki/VCS) Host details if
  [GitHub](https://github.com) is chosen
* scaffolds [CI](https://en.wikipedia.org/wiki/Continuous_integration) server
  config if [Travis](https://travis-ci.com) is chosen
* scaffolds the project `README.md`
* scaffolds language specific details by delegating to
  [provided scaffolder functions](#languages-optional)
  * Examples:
    * [JavaScript](https://github.com/travi/javascript-scaffolder)

## Usage

<!-- consumer badges -->

[![npm][npm-badge]][npm-link]
[![Snyk Vulnerabilities for npm package][snyk-badge]][snyk-link]
![node][node-badge]
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

#### Example

```javascript
import program from 'commander';
import {scaffold} from '@travi/project-scaffolder';
```

```javascript
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
```

#### Options

This is an opinionated scaffolder, but there are some aspects that are
configurable in order to support multiple contexts.

##### `languages` (_optional_)

provides the languages to choose from and the functions to perform the
scaffolding for the chosen language. if no languages are provided, `Other` will
be the only choice presented. Choosing `Other` will perform no language-specific
scaffolding.

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
    * `description`: __string__ short summary of the project

##### `vcsHosts` (_optional_)

provides the vcs hosts to choose from and the functions to perform the
scaffolding for the chosen host. if no hosts are provided, `Other` will be the
only choice presented. Choosing `Other` will perform no host-specific
scaffolding.

__object__:

* keys: __string__ Name of the language
* values: __object__
  * `prompt`: __function__ (_required_) prompts for host specific details
    * MUST return an object of the prompt answers, which MUST include the name
      of the account for the host that owns the repo as `repoOwner`
  * `scaffolder`: __function__ (_required_) scaffolds the host options
    * receives an options object as its first argument to pass along answers to
      the project-level prompts
      * `host`: __string__ name of the chosen host, as provided in the key of
        the `vcsHosts` object
      * `name`: __string__ name chosen for the project. defaults to the
        directory name.
      * `owner`: the account name of the owner of the repo on the host, as
        returned from the `prompt` function
      * `projectRoot`: __string__ path of the working directory where the CLI
        command was executed
      * `projectType`: __string__ primary language for the project
      * `description`: __string__ brief summary of the project
      * `homepage`: __string__ url of the project homepage
  * `public`: __boolean__ (_optional_) whether this host should be presented
    as a public option
  * `private`: __boolean__ (_optional_) whether this host should be presented
    as a private option

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
[![PRs Welcome][prs-badge]][prs-link]

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
* [github-scaffolder](https://github.com/travi/github-scaffolder)
* [travis-scaffolder-javascript](https://github.com/travi/travis-scaffolder-javascript)
* [cli](https://npm.im/@travi/cli)

## Inspiration

* [Yeoman](http://yeoman.io/)
* [Lass](https://lass.js.org/)

[npm-link]: https://www.npmjs.com/package/@travi/project-scaffolder

[npm-badge]: https://img.shields.io/npm/v/@travi/project-scaffolder.svg

[node-badge]: https://img.shields.io/node/v/@travi/project-scaffolder.svg

[license-link]: LICENSE

[license-badge]: https://img.shields.io/github/license/travi/project-scaffolder.svg

[ci-link]: https://travis-ci.com/travi/project-scaffolder

[ci-badge]: https://img.shields.io/travis/com/travi/project-scaffolder.svg?branch=master

[commit-convention-link]: https://conventionalcommits.org

[commit-convention-badge]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg

[commitizen-link]: http://commitizen.github.io/cz-cli/

[commitizen-badge]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg

[prs-link]: http://makeapullrequest.com

[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg

[snyk-badge]: https://img.shields.io/snyk/vulnerabilities/npm/@travi/project-scaffolder

[snyk-link]: https://snyk.io/test/npm/@travi/project-scaffolder
