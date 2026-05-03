---
---

# Commit Workflow

## Core Principle

Treat commit history as part of the product story for a branch.
Each commit should be production-quality, releasable, and contribute to a clean,
intentional history.

## Current Approval Rules

* Do not create commits automatically.
* Always show the full proposed commit message before creating a commit.
* Show the subject, body, and any footers in the proposal.
* Wait for explicit user approval before running `git commit`.
* For breaking changes, include the proposed `BREAKING CHANGE:` footer and
  migration instructions before asking for approval.

## Commit Story Rules

* Prefer a commit history that tells a coherent story of the feature or fix.
* Do not rely on squash merging to clean up history.
* Assume branch commits should be meaningful on their own.
* Keep commits focused and avoid mixing unrelated concerns.

## Fixup and Rebase Preferences

* When revising earlier work on a feature branch, prefer fixup commits over
  noisy follow-up commits that clutter the story.
* Prefer interactive rebase to fold fixup commits into the appropriate earlier
  commits before merge.
* Use fixup commits to improve an existing commit without changing the intended
  story of the branch.
* Preserve a clean progression of intent across the branch history.

## `wip` Commits

* `wip` commits are allowed for incremental work toward a later `feat` or
  `fix`.
* A `wip` commit must still be production-quality and releasable.
* Use `wip` only when the work is intentionally incomplete from a product
  perspective and there is no user-facing behavior change yet.
* Preserve `wip` commits in history to keep the progress story intact.

## Future Automation Guidance

If commit automation is enabled later:

* Continue to show the proposed commit message before creating commits unless
  explicitly instructed otherwise.
* Prefer creating fixup commits when adjusting previous commits on a branch.
* Prefer interactive rebase to clean up history before merge.
* Do not assume squash merge is the preferred cleanup strategy.
* Optimize for a branch history that communicates the right story to reviewers
  and future readers.

## Relationship to Commit Conventions

Use `.github/instructions/commit-conventions.md` for commit message format,
commit type selection, commitlint rules, and semantic-release behavior.
Use this file for approval, history, and workflow expectations.


