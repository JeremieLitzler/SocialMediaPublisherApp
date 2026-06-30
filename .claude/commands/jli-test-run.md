Run the test suite. Task folder: $ARGUMENTS

`$ARGUMENTS` must be the absolute task-folder path. If it is empty, stop and reply:

> Usage: `/jli-test-run <task-folder>` — I need the absolute task-folder path.

Derive `[worktree]` from the argument (the substring before `/docs/prompts/tasks/`). The
bare repo root has no `node_modules` — always `cd [worktree]` first.

## What this command does

Run Vitest in non-watch mode (failures only — saves tokens) from the worktree:

```bash
cd [worktree] && rtk vitest run
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
  > Tests failed (see `[task-folder]/test-results.md`). Run `/jli-git-commit [task-folder]`
  > to record the results, then `/jli-code [task-folder]` to fix, then re-run
  > `/jli-review [task-folder]` and `/jli-test-run [task-folder]`.
- If `status: passed`:
  > All tests pass. Run `/jli-git-commit [task-folder]`, then `/jli-git-ship [task-folder]`
  > to push, open the PR, and (after approval) merge and clean up.
