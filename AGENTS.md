# AGENTS.md: AI Agent Guide for `@form8ion/project`

## Executive Summary

This package is a __project lifting orchestrator__.
It evolves projects from their current state to modern conventions.
Scaffolding exists to capture the minimal decisions needed to persist
versioned state that later enables lifting.
Internal plugins are meant to resemble the plugins injected into
`scaffold()` and `lift()`.
The real value is in the __`lift` phase__, not scaffolding.

---

## Architecture Overview

### Data Flow

1. __Scaffold__ (`src/scaffolder.js`) captures project decisions and
   persists minimal versioned state.
1. __Tester__ (`src/<plugin>/tester.js`) detects that state and decides
   whether lifting should run.
1. __Lift__ (`src/lift.js`) applies the modernization work.

### Plugin Purpose and Boundaries

Plugins are provided externally through `options.plugins`.
The main plugin groups are:

* `languages` for language-specific detection and modernization.
* `vcsHosts` for repository host setup and host-specific lifting.
* `ciProviders` for CI/CD setup and modernization.
* `dependencyUpdaters` for automated dependency update setup.

__Plugin shape:__
`{scaffold?, lift?, test?, prompt?, qualify?, remove?}`.

__Primary focus:__
`lift` functions evolve projects to modern conventions.

---

## File Structure and Plugin Pattern

### Internal Plugin Anatomy

Most internal plugins live in `src/<plugin-name>/`.
Common files are:

* `prompt.js` for plugin-context questions and `*_PROMPT_ID`.
* `scaffolder.js` for minimal persistence of chosen details.
* `tester.js` for detection and lift gating.
* `lifter.js` for modernization logic.
* `index.js` for plugin-convention re-exports.
* `*.test.js` colocated beside implementation.

Typical flow inside a plugin:

* `scaffolder.js` captures versioned details.
* `tester.js` detects those details or equivalent existing state.
* `lifter.js` runs once the tester confirms the plugin applies.

Follow existing `index.js` re-export patterns like
`src/language/index.js`.

Example:

```javascript
export {default as scaffold} from './scaffolder.js';
export {default as prompt} from './prompt.js';
```

### Important Directories

* `src/scaffolder.js` orchestrates scaffolding across internal plugins.
* `src/lift.js` applies enhancers for lifting.
* `src/prompts/` contains the shared prompt registry.
* `test/integration/features/` holds Cucumber feature files.

---

## Prompt and Question Wiring Pattern

### Prompt Purpose

Prompts are primarily used during scaffolding.
They are where decisions are made.
Scaffolding persists those decisions into versioned files that testers
can later detect.

Example flow:

* __Prompt:__ decide `projectLanguage: 'javascript'`.
* __Scaffold:__ persist that decision into versioned files.
* __Tester:__ detect the scaffolded state and gate lifting.
* __Lift:__ modernize the project after detection succeeds.

### Central Registry

Wire every prompt through these files together:

* `src/<plugin>/prompt.js`
* `src/prompts/index.js`
* `src/prompts/question-names.js`

Use `example.js` as the canonical consumer pattern.
Dispatch by `id`.
Resolve answer keys from `promptConstants.questionNames`.
Throw on unknown prompt IDs.

A typical plugin prompt module defines both the prompt ID and the
plugin-context questions.

Example prompt module shape from `src/language/prompt.js`:

```javascript
import {questionNames} from '../prompts/question-names.js';

export const PROJECT_LANGUAGE_PROMPT_ID = 'PROJECT_LANGUAGE';

const {PROJECT_LANGUAGE} = questionNames.PROJECT_LANGUAGE;

export default function promptForProjectLanguage(languages, {prompt}) {
  return prompt({
    id: PROJECT_LANGUAGE_PROMPT_ID,
    questions: [{
      name: PROJECT_LANGUAGE,
      type: 'list',
      message: 'What type of project is this?',
      choices: [...Object.keys(languages), 'Other']
    }]
  });
}
```

Canonical consumer shape from `example.js`:

```javascript
prompt: async ({id}) => {
  const {questionNames, ids} = promptConstants;
  const {PROJECT_LANGUAGE: projectLanguagePromptId} = ids;

  switch (id) {
    case projectLanguagePromptId: {
      const {PROJECT_LANGUAGE} = questionNames[projectLanguagePromptId];

      return {[PROJECT_LANGUAGE]: 'foo'};
    }
    default:
      throw new Error(`Unknown prompt with ID: ${id}`);
  }
}
```

---

## Build, Test, and Verification Commands

Useful commands from `package.json`:

```bash
npm run build
npm run test:unit
npm run test:integration
npm run test:integration:wip
npm run test:integration:focus
npm run lint:md
```

Notes:

* `npm test` runs linting, unit tests, and integration tests.
* Integration tests run against the built package from `lib/`.
* `test:integration:wip` is for committed `@wip` scenarios.
* `test:integration:focus` is for local iteration and should not be
  committed with `@focus`.

---

## Testing Patterns

### Unit Tests

Unit tests are colocated as `*.test.js`.
Use `vitest` for test execution.
Use `vitest-when` for conditional mock behavior.
Use `@travi/any` for generated test data.

Import ordering in unit tests uses three groups:

* other packages such as `node:path` or `deepmerge`
* testing dependencies such as `vitest`, `vitest-when`, and
  `@travi/any`
* relative imports

Example unit test shape from `src/language/prompt.test.js`:

```javascript
import {describe, expect, it, vi} from 'vitest';
import any from '@travi/any';
import {when} from 'vitest-when';

import {questionNames} from '../prompts/question-names.js';
import promptForLanguageDetails, {PROJECT_LANGUAGE_PROMPT_ID} from './prompt.js';

vi.mock('@form8ion/overridable-prompts');

const {PROJECT_LANGUAGE} = questionNames.PROJECT_LANGUAGE;

describe('language prompt', () => {
  it('should prompt for the language details', async () => {
    const prompt = vi.fn();
    const answers = any.simpleObject();
    const languages = any.simpleObject();
    when(prompt).calledWith({
      id: PROJECT_LANGUAGE_PROMPT_ID,
      questions: [{
        name: PROJECT_LANGUAGE,
        type: 'list',
        message: 'What type of project is this?',
        choices: [...Object.keys(languages), 'Other']
      }]
    }).thenResolve(answers);

    expect(await promptForLanguageDetails(languages, {prompt})).toEqual(answers);
  });
});
```

### Integration Tests

Integration tests live under `test/integration/features/`.
Use Cucumber and Gherkin feature files.
Use `testdouble` for ESM mocking.
Use `chai` assertions in `Then` steps.
Use the shared world in
`test/integration/features/support/world.mjs` for scenario state.

Workflow is outside-first:

1. define or update the integration scenario first
1. drive internal layers with unit tests
1. implement the minimum code needed
1. finish the integration scenario once the flow works end to end

---

## Source Conventions

Use ESM only in `src/**/*.js`.
Default exports should be named functions.
Route plugin exports through the plugin `index.js` file.
Keep internal plugin naming aligned with injected plugin naming.

Import ordering in source files uses two groups:

* package imports first
* relative imports second

Example source import ordering from `src/scaffolder.js`:

```javascript
import deepmerge from 'deepmerge';
import {execa} from 'execa';
import {questionNames as coreQuestionNames} from '@form8ion/core';

import {scaffold as scaffoldLanguage} from './language/index.js';
import {validate} from './options-validator.js';
```

Prompt ID constants should use the `*_PROMPT_ID` pattern.
Question key maps should live in `questionNames`.
Prompt ID aggregation should live in `ids`.

---

## Scaffolding-to-Lifting Transition

This repository is shifting from a scaffolding-first model to a
lifting-first model.
You may still find plugins with heavier scaffolding than the intended
end state.
That is expected during the transition.

Directionally:

* keep the scaffold → detect → lift flow intact
* reduce scaffolding complexity over time
* prefer moving durable behavior into lifters
* keep prompts focused on decisions needed for persisted state

Do not refactor existing scaffolding just for style unless explicitly
requested.

---

## Public API Surface

`src/index.js` is the package boundary.
It exports the scaffold API, the lift API, and `promptConstants`.
Keep prompt constants wrapped as `promptConstants = {ids, questionNames}`.

---

## High-Value References

* `example.js` for prompt dispatch shape
* `src/prompts/index.js` for prompt ID aggregation
* `src/prompts/question-names.js` for answer-key mapping
* `src/scaffolder.js` for orchestration
* `src/lift.js` for enhancer application
* `src/license/tester.js` for plugin detection
* `src/editorconfig/tester.js` for plugin detection
* `.github/copilot-instructions.md` for repository rules
* `.github/instructions/*.instructions.md` for JS and testing details
