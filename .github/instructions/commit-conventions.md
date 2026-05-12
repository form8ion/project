---
---

# Commit Message Conventions

This project uses [semantic-release](https://github.com/semantic-release/semantic-release)
with the default Angular commit convention to automate versioning and releases.

## Rule Sources

Effective commit rules come from the repo config chain.

* `.commitlintrc.json` extends `@form8ion`
* `@form8ion/commitlint-config` extends
  `@commitlint/config-conventional`

Use these rules as the source of truth when writing commits.

## Core Principle

Write commit messages from the **consumer perspective**, not from an
implementation perspective.

This means:

* Use the commit type that accurately describes what the commit does
* The commit type makes clear whether the change affects consumers:
  * `feat`, `fix`, `perf`, and `BREAKING CHANGE:` affect consumers
  * `test`, `docs`, `chore`, `refactor` do not affect consumers
* semantic-release uses this to determine whether to create a release
* Always include clear motivation for why the change was made

## Format

Follow Angular convention:

```
<type>(<scope>): <summary>

<body>

<footer>
```

## Type

Allowed commit types include conventional types plus `wip`.

* Release-triggering types: `feat`, `fix`, `perf`
* Non-release types: `build`, `chore`, `ci`, `docs`, `refactor`,
  `revert`, `style`, `test`, `wip`

Type should describe the primary intent of the commit:

* `feat`: new user-facing capability
* `fix`: user-facing bug fix
* `perf`: user-facing performance improvement
* `refactor`: structural/internal change with no user-facing behavior or API
  impact
* `test`: tests only
* `docs`: documentation only
* `chore`/`build`/`ci`/`style`: maintenance and tooling

`refactor` is valid only when there is no user-facing behavior or API change.
If the public interface changes, use `feat` or `fix` and add
`BREAKING CHANGE:` when required.

### `wip` Type

`wip` is for incremental work toward another type, usually a future `feat` or
`fix`, when there is no user-facing behavior change yet.

A `wip` commit should still be production-quality and releasable.
It is distinct from other non-release types because it communicates
in-progress product work, not just maintenance or documentation updates.

When any `@word` token appears in a commit message summary or body, wrap it in
backticks to prevent GitHub from interpreting it as a user mention.
Cucumber tags (such as `@wip` or `@skip`) are a common source of this.

## Scope

`scope` should be kebab-case.
Choose a scope that reflects the package area, for example `prompts`,
`scaffolder`, `api`, `vcs`, or `language`.

## Line Length and Lint Constraints

commitlint enforces these limits:

* Header max length: `100`
* Body line max length: `100`
* Footer line max length: `100`

It also enforces lowercase `type` and kebab-case `scope`.

## Summary

The summary line should:

* State the purpose of the change
* Be imperative
* Match the selected type and scope

Good examples:

* `feat(prompts): define prompt constants for prompt-specific expectations`
* `test(language): cover scaffolder fallback behavior`
* `wip(prompts): split prompt-id mapping before feat completion`

Poor examples:

* `refactor(api): remove questionNames from public exports`
* `update copilot instructions`

## Breaking Changes

A breaking change is **only** when the public API or consumer-facing contract
changes.

Examples of breaking changes:

* Removing a public export
* Changing required function signatures
* Modifying the structure of returned values
* Changing behavior consumers depend on

Examples of changes that are usually not breaking by themselves:

* Moving internal code between files
* Updating internal documentation or instructions
* Changing test structure or test files
* Updating how internal constants are wired

## BREAKING CHANGE Footer

When introducing a breaking change:

* Include a `BREAKING CHANGE:` footer
* State what changed for consumers
* Include migration instructions

Example:

```
BREAKING CHANGE: `questionNames` is no longer exported from @form8ion/project

Use `promptConstants.questionNames` instead of importing `questionNames`
directly from `@form8ion/project`.
```

## Body

In the body, explain:

* Why the change was made
* What changes for users when consumer-facing
* Technical context needed for reviewers
