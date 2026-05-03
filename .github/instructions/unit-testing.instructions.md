# Unit Testing Instructions (`src/**/*.test.js`)

> For integration testing under `test/integration/`, see
> `.github/instructions/integration-testing.instructions.md`.

applyTo: "src/**/*.test.js"

## File Placement

* Test files are colocated with implementation.
* Use `foo.js` -> `foo.test.js` naming.
* Do not create `__tests__` directories for unit tests.

## Test Runner and Core Imports

* Use `vitest` named imports (`describe`, `it`, `expect`, `vi`).
* Import `beforeEach` and `afterEach` only when required.
* Do not use `beforeAll` or `afterAll` unless already present.

## Test Data

* Use `@travi/any` for generated test data.
* Use `any.simpleObject()` for plain objects.
* Use `any.word()` for short arbitrary strings or strings where special
  characters would introduce unintended variability to the test.
* Use `any.string()` for arbitrary strings.
* Hardcode values only when testing a specific literal.

## Mocking

* Use `vitest-when` (`when`) for conditional mock behavior.
* Use `vi.fn()` for inline function mocks.
* Use `vi.mock('...')` to mock modules.
* Place `vi.mock(...)` calls after imports and before `describe`.
* Avoid `.mockResolvedValue(...)`.
* Prefer `when(...).calledWith(...)`.
* Use `.calledWith()` with no arguments when that is the behavior.

## Import Ordering in Test Files

Use a three-group pattern in unit test files.
Separate each group with one blank line.

1. Other package imports, including Node built-ins with `node:` prefixes.
1. Testing dependencies (for example `vitest`, `vitest-when`, and
   `@travi/any`).
1. Internal project imports (relative paths).

Within each group, keep ordering consistent with nearby files.
Within relative imports, more parent traversals come first.
Same-directory imports should be last.

## Test Structure

* Follow TDD with short Red-Green-Refactor cycles.
* Apply the three laws of TDD.
* Write a failing test before writing production code.
* Write only enough production code to pass the failing test.
* Refactor only after tests are green.
* Use one top-level `describe` per file.
* Name cases with `it('should ...')`.
* Structure each case as arrange -> act -> assert.
* Extract duplication from individual tests.
* Move repeated variable definitions to the `describe` scope.
* Move repeated stubs and mocks to `beforeEach`.
* Avoid mixing multiple unrelated assertions in one case.

## Coverage Expectations

* Cover a success path for every module.
* Cover relevant edge and failure paths.
* Focus assertions on observable behavior.
* Do not write coverage-only tests that execute code without asserting behavior.
* Do not leave new logic without focused tests.

## Reference Examples

| Scenario                            | Reference file                               |
| ----------------------------------- | -------------------------------------------- |
| Simple prompt test with `when`      | `src/language/prompt.test.js`                |
| Multiple edge cases, no mocks       | `src/license/lifter.test.js`                 |
| Module-level `vi.mock` + `when`     | `src/dependency-updater/scaffolder.test.js` |
| Complex orchestration with `beforeEach` | `src/scaffolder.test.js`                 |

## Prohibited

* Do not use `jest` APIs.
* Do not use `sinon` or other non-`vitest` mocking libraries.
* Do not import from `@jest/globals`.
* Do not hardcode values that `@travi/any` should generate.
