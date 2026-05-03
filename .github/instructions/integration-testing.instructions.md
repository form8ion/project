# Integration Testing Instructions (`test/integration/**`)

applyTo: "test/integration/**"

## Approach

Integration tests use Cucumber BDD with Gherkin `.feature` files.
Integration tests use JavaScript step definitions.
They exercise the built package (`@form8ion/project` from `lib/`).
They do not exercise source files directly.
Integration scripts run a build first (`pretest:integration:base`).

## File Layout

```
test/integration/features/
  <domain>/          # .feature files grouped by domain (scaffold/, lift/)
  step_definitions/  # Given/When/Then implementations
  support/           # world.mjs and other shared setup
```

* Add new `.feature` files in the domain folder for that behavior.
* Add feature steps in `<domain>-steps.js` in `step_definitions/`.
* Put reusable shared steps in `common-steps.js`.

## Test Runner

* Runner is `@cucumber/cucumber` via `cucumber-js`.
* Profiles in `cucumber.js` are `noWip`, `wip`, and `focus`.
* Tag in-progress scenarios with `@wip`.
* Remove `@wip` when a scenario is complete.
* Use `@focus` locally only.
* Do not commit `@focus`.
* Use `@skip` for intentionally skipped scenarios.

## World

* `test/integration/features/support/world.mjs` stores scenario answer state.
* Use `this.setAnswerFor(questionName, value)` to persist answers.
* Use `this.getAnswerFor(questionName)` to retrieve answers.
* Avoid writing ad hoc properties to `this` unless necessary.

## Step Definition Imports

Integration step files use a three-group exception.
Separate each group with one blank line.

1. Other package imports, including Node built-ins with `node:` prefixes.
1. Testing dependencies (for example `@cucumber/cucumber`, `chai`,
   `@travi/any`, `testdouble`, and `mock-fs`).
1. Internal project imports (relative paths).

Within each group, keep ordering consistent with nearby files.

## Mocking

* Use `testdouble` (`td`) for ESM module mocking.
* Do not use `vi` or `sinon` for default integration mocking.
* Use `td.replaceEsm('module-name')` before importing the subject.
* Use `td.reset()` in `After` hooks.
* Use `mock-fs` (`stubbedFs`) for filesystem stubbing.
* Always call `stubbedFs.restore()` in `After`.
* Load real `node_modules` into the stub when needed.

## Assertions

* Use `chai` `assert`.
* Keep assertions in `Then` steps when possible.
* Use assertions in `When` only for immediate observable side effects.

## Test Data

* Use `@travi/any` for arbitrary test data.
* Keep scenario data in `World`.
* Avoid module-level mutable state for scenario data.

## Prompt Simulation

* `common-steps.js` provides a `prompt` switch based on `ids.*`.
* Add a matching `case` when adding a prompt ID in
  `src/prompts/index.js`.
* Throw on unknown `id` values to surface missing prompt wiring.

## Running Tests

```bash
npm run test:integration
npm run test:integration:wip
npm run test:integration:focus
```

## Prohibited

* Do not import `src/` modules in steps except shared constants.
* Do not use `vitest` APIs in integration tests.
* Do not use `sinon` unless `testdouble` cannot cover a case.
* Do not commit `@focus` or stale `@wip` tags.
