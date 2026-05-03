# Review Checklist (Strict)

Use this checklist for pull requests and local reviews.

## Scope

* [ ] Changes are minimal and tied directly to the requested task.
* [ ] No unrelated cleanup, refactoring, or file moves are included.
* [ ] Public interfaces stay stable unless the task requires a change.

## Prompt and Question Contracts

* [ ] New prompt IDs follow `*_PROMPT_ID` naming.
* [ ] Prompt aggregators use `ids` with `CONSTANT_CASE` keys.
* [ ] Question maps use `questionNames` and avoid duplicate intent.
* [ ] Core prompt wiring updates are reflected in `src/prompts/index.js`.
* [ ] New keys are added in `src/prompts/question-names.js` when needed.

## Module and File Placement

* [ ] New file names use `kebab-case` and are noun-based.
* [ ] New function names are verb-based.

* [ ] Logic stays in role files such as `prompt.js` and `scaffolder.js`.
* [ ] No new architectural patterns are introduced without approval.
* [ ] File and folder placement matches existing `src/` patterns.

## Testing

* [ ] Every behavior change updates colocated `*.test.js` files.
* [ ] TDD is followed with short Red-Green-Refactor cycles.
* [ ] The three laws of TDD are followed.
* [ ] Tests cover success behavior and relevant edge or failure behavior.
* [ ] Assertions verify observable behavior, not just code execution.
* [ ] No coverage-only tests are added without behavior assertions.
* [ ] Repeated variable setup is extracted to `describe` scope.
* [ ] Repeated stubs and mocks are extracted to `beforeEach`.
* [ ] Existing test style in the feature folder is preserved.

## Code Quality

* [ ] ESM style (`import` / `export`) is preserved.
* [ ] Node built-in imports use the `node:` prefix.
* [ ] Most files use two groups: packages, then relative imports.
* [ ] Unit and integration test files use three groups: other packages,
      testing dependencies, then relative imports.
* [ ] Package ordering follows built-ins, third-party, `@travi`,
      then `@form8ion`.
* [ ] Relative imports put farther parents first and same-directory last.
* [ ] Import ordering and formatting match surrounding code.
* [ ] No unnecessary dependencies were added.
* [ ] Complex logic is not reimplemented when a popular package handles it.
* [ ] No comments are present; logic reads clearly without them.
