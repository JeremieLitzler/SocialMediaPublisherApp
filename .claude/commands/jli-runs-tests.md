Run the test suite. Task folder: $ARGUMENTS

`$ARGUMENTS` is the task folder, given as a `@`-mention relative to the worktree root you
opened (e.g. `@docs/prompts/tasks/issue-<id>-<slug>`). If it is empty, stop and reply:

> Usage: `/jli-runs-tests @<task-folder>` — open the feature worktree (`code <worktree>`) first,
> then pass the task folder relative to it.

Run from the worktree root (your current directory) — that is where `node_modules` lives.

## What this command does

Run Vitest in non-watch mode (failures only — saves tokens) from the worktree:

```bash
rtk vitest run
```

## Output contract

Write `[task-folder]/test-results.md` using this template:

```markdown
# Test Results — Issue #[id]: [title]

## Test Run

Command: `npm test` (Vitest vX.Y.Z) from the `[worktree name]` worktree.

## Files Run

All those mentioned in [technical specs](technical-specifications.md).

## Results

<if all pass>
All tests passed. No failures.

### Test Summary

[N] test files, [N] tests total — all passed.

- Duration: ~[N] seconds
<else>
### Failures

<each failing test with its stack trace / error output>
<end-if>

status: passed
```

Rules:
- If any test fails, replace the Results section with failure details and replace
  `status: passed` with `status: failed`.
- The status line is always the last line of the file.

## Shell command retry limit

Do not run more than 3 failing shell commands in total. After 3 failures, stop, record the
full error output in `test-results.md`, and end the file with `status: failed`.

## Next

- If `status: failed`:
  > Tests failed (see `test-results.md` in the task folder). Run `/jli-commits @<task-folder>`
  > to record the results, then `/jli-codes @<task-folder>` to fix, then re-run
  > `/jli-reviews-code @<task-folder>` and `/jli-runs-tests @<task-folder>`.
- If `status: passed`:
  > All tests pass. Run `/jli-commits @<task-folder>`, then `/jli-ships @<task-folder>`
  > to push, open the PR, and merge after approval.
