# project

opinionated scaffolder for new projects

<!--status-badges start -->

[![Node CI Workflow Status][github-actions-ci-badge]][github-actions-ci-link]
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/form8ion/project/badge)](https://securityscorecards.dev/viewer/?uri=github.com/form8ion/project)
[![Codecov][coverage-badge]][coverage-link]
![SLSA Level 2][slsa-badge]

<!--status-badges end -->

## Table of Contents

* [Features](#features)
* [Usage](#usage)
  * [Installation](#installation)
  * [Consumption in a CLI tool](#consumption-in-a-cli-tool)
  * [Example](#example)
    * [Import](#import)
    * [Execute](#execute)
  * [API](#api)
    * [`languages` (_optional_)](#languages-optional)
    * [`vcsHosts` (_optional_)](#vcshosts-optional)
    * [`dependencyUpdaters` (_optional_)](#dependencyupdaters-optional)
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
* scaffolds the chosen [VCS](https://en.wikipedia.org/wiki/VCS) Host details
* scaffolds the chosen [CI](https://en.wikipedia.org/wiki/Continuous_integration)
  service config
* scaffolds the project `README.md`
* scaffolds language specific details by delegating to
  [provided scaffolder functions](#languages-optional)

## Usage

<!--consumer-badges start -->

[![npm][npm-badge]][npm-link]
![node][node-badge]
[![MIT license][license-badge]][license-link]

<!--consumer-badges end -->

### Installation

```sh
$ npm install @form8ion/project --save-prod
```

### Consumption in a CLI tool

This scaffolder is intended to be used as a CLI tool, but it is left up to the
consumer to provide the actual CLI wrapper. My [sub-command](https://github.com/travi/scaffolder-sub-command)
for [commander](https://www.npmjs.com/package/commander) is an example of such
a wrapper.

### Example

#### Import

```javascript
import {ungroupObject} from '@form8ion/core';
import {lift, questionNames, scaffold} from '@form8ion/project';
```

#### Execute

```javascript
const plugins = {
  dependencyUpdaters: {
    bar: {scaffold: options => options}
  },
  languages: {
    foo: {scaffold: options => options}
  },
  vcsHosts: {
    baz: {
      scaffold: options => options,
      prompt: () => ({repoOwner: 'form8ion'})
    }
  }
};

await scaffold(
  {plugins},
  {
    prompt: () => ({
      [questionNames.PROJECT_NAME]: 'my-project',
      [questionNames.LICENSE]: 'MIT',
      [questionNames.VISIBILITY]: 'Public',
      [questionNames.DESCRIPTION]: 'My project',
      [questionNames.GIT_REPO]: false,
      [questionNames.COPYRIGHT_HOLDER]: 'John Smith',
      [questionNames.COPYRIGHT_YEAR]: '2022',
      [questionNames.PROJECT_LANGUAGE]: 'foo'
    })
  }
);

await lift({
  projectRoot: process.cwd(),
  results: {},
  enhancers: ungroupObject(plugins),
  vcs: {}
});
```

### API

This is an opinionated scaffolder, but there are some aspects that are
configurable in order to support multiple contexts.

Takes a single options object as an argument, containing:

#### `languages` (_optional_)

provides the languages to choose from and the functions to perform the
scaffolding for the chosen language. if no languages are provided, `Other` will
be the only choice presented. Choosing `Other` will perform no language-specific
scaffolding. Official options are provided [in the awesome list](https://github.com/form8ion/awesome#languages).

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
      * `host`: __string__ host name
      * `name`: __string__ repository name. equal to `projectName`
      * `owner`: __string__ account name on the host service for the repository
        owner. defaults to `$ git config github.user`
    * `visibility`: __string__ `Public` or `Private`. defaults to `Private`
    * `license`: __string__ identifier of the chosen [SPDX License](https://spdx.org/licenses/)
      or `UNLICENSED`
    * `ci`: __string__ name of the chosen CI service. defaults to `Travis`
    * `description`: __string__ short summary of the project

#### `vcsHosts` (_optional_)

provides the vcs hosts to choose from and the functions to perform the
scaffolding for the chosen host. if no hosts are provided, `Other` will be the
only choice presented. Choosing `Other` will perform no host-specific
scaffolding. Official options are provided [in the awesome list](https://github.com/form8ion/awesome#version-control-services).

__object__:

* keys: __string__ Name of the vcs host
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
      * `description`: __string__ brief summary of the project
      * `homepage`: __string__ url of the project homepage
  * `public`: __boolean__ (_optional_) whether this host should be presented
    as a public option
  * `private`: __boolean__ (_optional_) whether this host should be presented
    as a private option

#### `dependencyUpdaters` (_optional_)

provides the dependency updaters to choose from and the functions to perform the
scaffolding for the chosen updater service. if no updater services are provided,
`Other` will be the only choice presented. Choosing `Other` will perform no
updater-service-specific scaffolding. Official options are provided [in the awesome list](https://github.com/form8ion/awesome#dependency-update-services).

__object__:

* keys: __string__ Name of the dependency update service
* values: __object__
  * `scaffolder`: __function__ (_required_) scaffolds the host options
    * receives an options object as its first argument to pass along answers to
      the project-level prompts
      * `projectRoot`: __string__ path of the working directory where the CLI
        command was executed
    * `vcs`: __object__ details about the [VCS](https://en.wikipedia.org/wiki/Version_control)
      host
      * `host`: __string__ host name
      * `name`: __string__ repository name. equal to `projectName`
      * `owner`: __string__ account name on the host service for the repository
        owner. defaults to `$ git config github.user`

## Contributing

<!--contribution-badges start -->

[![Conventional Commits][commit-convention-badge]][commit-convention-link]
[![Commitizen friendly][commitizen-badge]][commitizen-link]
[![PRs Welcome][prs-badge]][prs-link]
[![Renovate][renovate-badge]][renovate-link]
[![semantic-release: angular][semantic-release-badge]][semantic-release-link]

<!--contribution-badges end -->

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

[npm-link]: https://www.npmjs.com/package/@form8ion/project

[npm-badge]: https://img.shields.io/npm/v/@form8ion/project?logo=npm

[license-link]: LICENSE

[license-badge]: https://img.shields.io/github/license/form8ion/project.svg?logo=opensourceinitiative

[commit-convention-link]: https://conventionalcommits.org

[commit-convention-badge]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg

[commitizen-link]: http://commitizen.github.io/cz-cli/

[commitizen-badge]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg

[prs-link]: http://makeapullrequest.com

[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg

[renovate-link]: https://renovatebot.com

[renovate-badge]: https://img.shields.io/badge/renovate-enabled-brightgreen.svg?logo=renovatebot

[github-actions-ci-link]: https://github.com/form8ion/project/actions?query=workflow%3A%22Node.js+CI%22+branch%3Amaster

[github-actions-ci-badge]: https://img.shields.io/github/actions/workflow/status/form8ion/project/node-ci.yml.svg?branch=master&logo=github

[node-badge]: https://img.shields.io/node/v/@form8ion/project?logo=node.js

[coverage-link]: https://codecov.io/github/form8ion/project

[coverage-badge]: https://img.shields.io/codecov/c/github/form8ion/project?logo=codecov

[slsa-badge]: https://slsa.dev/images/gh-badge-level2.svg

[semantic-release-link]: https://github.com/semantic-release/semantic-release

[semantic-release-badge]: https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release
