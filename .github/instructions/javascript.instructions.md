---
applyTo: "src/**/*.js"
---

# JavaScript Source Instructions (`src/**/*.js`)

## Module Format

* Use ESM only: `import` / `export`.
* Do not use `require` or `module.exports`.
* Feature implementation files default-export their primary function.
* Common files are `scaffolder.js`, `lifter.js`, `tester.js`, and `prompt.js`.
* Directory `index.js` files re-export defaults as plugin conventions
  (protocol contract) names.
* Accepted plugin convention names are `scaffold`, `lift`, `test`,
  `remove`, and `qualify`.
* Route exports through directory `index.js` files.

```js
export {default as scaffold} from './scaffolder.js';
export {default as lift} from './lifter.js';
export {test} from './tester.js';
```

## Import Ordering

Use exactly two import groups in source files.
Place package imports first and relative imports second.
Separate only these two groups with one blank line.

Within package imports, order by distance from furthest to closest:

1. Node built-ins, using the `node:` prefix.
1. Third-party packages (excluding `@travi/*` and `@form8ion/*`).
1. `@travi/*` packages.
1. `@form8ion/*` packages.

Within relative imports, put more parent traversals first.
Keep same-directory imports (`./`) last.
When distance is equal, match nearby file ordering.

## Prompt Module Shape

Prompt modules (`prompt.js`) must follow existing patterns.

* Export a `*_PROMPT_ID` string constant.
* Export a function that calls `prompt({id, questions})`.
* Source question keys from `../prompts/question-names.js`.
* Use keys through the shared `questionNames` map.

Example structure to follow: `src/language/prompt.js`.

## Prompt Consumer Pattern

Code that implements a `prompt` handler must dispatch by `id`:

* Accept the prompt payload and destructure only the properties the handler
  uses, including `id`.
* Destructure `{questionNames, ids}` from `promptConstants` (the public export
  from this package).
* Alias each needed prompt ID from `ids` to a local `*PromptId` variable.
* Use `switch (id)` with one `case` block per prompt ID.
* Within each `case`, destructure the relevant question key names from
  `questionNames[promptId]`.
* Always include a `default` case that throws an error with the unknown
  prompt ID.

Canonical examples: `example.js` in this repo and `form8ion/github` `example.js`.

## Scaffolder / Lifter Module Shape

* Use a default export for the primary function.
* The exported function must be named, not anonymous.
* Name functions with a verb (for example `scaffold`, `lift`, `prompt`).
* Accept `(options, {prompt, logger})` or a relevant subset.
* Match existing signatures in the same feature area.
* Delegate to colocated modules.
* Re-export defaults from directory `index.js` using plugin convention
  names.

Reference: `form8ion/vitest` `src/scaffolder.js` and `src/index.js`.

## Public API Surface (`src/index.js`)

* `src/index.js` is the package boundary.
* Add exports there only when a feature must be public API.
* Keep prompt constants wrapped as `promptConstants = {ids}`.
* Do not flatten or restructure this object.
* Do not remove or rename existing exports.

## Testing

See `.github/instructions/unit-testing.instructions.md` for testing rules.
Every behavior change requires updates to colocated `*.test.js` files.

## Prohibited

* Do not use CommonJS (`require`, `exports`).
* Do not introduce `class` syntax unless already present in the file.
* Do not use barrel re-exports that break tree-shaking boundaries.
* Do not add dependencies without an explicit request.
* Prefer a well-maintained package over complex local logic when one exists.
