# Copilot Instructions for `form8ion/project` (Strict)

## Primary Rule

Follow existing repository patterns exactly.
Do not introduce new architecture, naming conventions, or directory structure.
Only do that when explicitly requested.

## Scope and Safety

* Make the smallest possible change to satisfy the request.
* Do not perform unrelated cleanup, refactors, or file moves.
* Preserve existing public exports and contracts unless a break is required.
* If required behavior is ambiguous, ask for clarification.

## Repository Conventions (Mandatory)

* Use ESM syntax only (`import` / `export`) in `src/**/*.js`.
* Feature implementation files usually default-export their primary function.
* Re-export plugin convention (protocol contract) names from each directory
  `index.js`.
* Valid plugin convention names include `scaffold`, `lift`, `test`,
  `remove`, and `qualify`.
* Keep feature logic in existing role files.
  * `prompt.js`
  * `schema.js`
  * `scaffolder.js`
  * `lifter.js`
  * `tester.js`
  * `index.js`
* Keep tests colocated with implementation as `*.test.js`.

## Naming Rules (Mandatory)

* File names use `kebab-case` and are noun-based.
* Function names are verb-based.
* Default export functions must be named, not anonymous.
* Prompt ID constants must use `*_PROMPT_ID`.
* Shared question maps must use `questionNames`.
* Prompt ID aggregators must use `ids`.
* Aggregator keys stay `CONSTANT_CASE`.
* Reuse existing identifiers where possible.

## Prompt Wiring Rules (Mandatory)

When adding or modifying prompt flow:

1. Define and export the prompt ID constant in the feature module.
1. Wire the prompt ID into `src/prompts/index.js` if it is in core flow.
1. Add or update keys in `src/prompts/question-names.js` when needed.
1. Merge through existing `questionNames` composition patterns.
1. Do not remove or rename existing IDs or keys unless requested.

### Prompt Consumer Pattern (Mandatory)

Consumers of the prompt handler must dispatch by `id` and resolve question key
names through `promptConstants`:

* Accept the prompt payload and destructure only the properties the handler
  uses, including `id`.
* Destructure `{questionNames, ids}` from `promptConstants`.
* Alias each prompt ID from `ids` into a local `*PromptId` variable.
* Use a `switch (id)` with one `case` per prompt ID.
* Within each `case`, destructure question key names from
  `questionNames[promptId]`.
* Throw an error with the unknown prompt ID in the `default` case.
* Reference `example.js` and `form8ion/github` `example.js` for the canonical
  shape.

## Testing Rules (Mandatory)

* Any behavior change requires test updates.
* Follow TDD and the three laws with Red-Green-Refactor iteration.
* Unit test rules live in
  `.github/instructions/unit-testing.instructions.md`.
* Integration rules live in
  `.github/instructions/integration-testing.instructions.md`.
* Do not leave new logic untested.

## Code Style Rules

* Match import ordering and formatting in the edited file.
* Prefix Node built-in imports with `node:`.
* Use two separated import groups in most files.
* Put package imports first and relative imports second.
* Keep exactly one blank line between package and relative groups.
* Within package imports, order by distance as built-ins, third-party,
  `@travi`, then `@form8ion`.
* In relative imports, more parent traversals come first and same-folder
  imports come last.
* For test files, use three groups: other packages,
  testing dependencies, then relative imports.
* Prefer simple, explicit logic over abstractions.
* Prefer existing popular packages over complex local logic.
* Do not add dependencies for things easily done inline.
* Avoid comments; write code that reads clearly without them.
* In markdown documentation, use at most one sentence per line.
* In markdown tables, use spaces around cells for readability.

## README and Documentation

* Do not hand-edit the `## Example` section of `README.md`.
* Run `npm run generate:md` to regenerate it from `example.js` via remark.
* The script runs `remark . --output` after a build, so a build must be current.

## Prohibited Without Explicit Request

* Cross-feature refactors.
* Renaming files or symbols for style only.
* Reorganizing folder structure.
* Changing module boundaries.
* Altering behavior outside task scope.

## Completion Checklist

* Change is minimal and task-focused.
* Naming follows repository conventions.
* Prompt and question wiring is consistent with `src/prompts/index.js`.
* Tests are added or updated for behavior changes.
* No unrelated modifications were introduced.
