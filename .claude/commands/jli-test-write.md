Write test artifacts for a feature. Task folder (and optional pass): $ARGUMENTS

`$ARGUMENTS` starts with the task folder, given as a `@`-mention relative to the worktree
root you opened (e.g. `@docs/prompts/tasks/issue-<id>-<slug>`), optionally followed by `1` or
`2` to force the pass. If it is empty, stop and reply:

> Usage: `/jli-test-write @<task-folder> [1|2]` — open the feature worktree
> (`code <worktree>`) first, then pass the task folder relative to it.

Run from the worktree root (your current directory). All paths below are relative to it; read
and write only inside this worktree.

## Pass selection

Determine the pass (the user may override with a trailing `1` or `2`):
- **Pass 1** if `[task-folder]/test-cases.md` does not yet exist.
- **Pass 2** if `[task-folder]/test-cases.md` exists AND
  `[task-folder]/technical-specifications.md` exists.

State which pass you are running before proceeding.

## Pass 1 — Before coding (writes `test-cases.md`)

Read `[task-folder]/business-specifications.md` and `[task-folder]/security-guidelines.md`.

Write `[task-folder]/test-cases.md` — plain-language scenarios only. No TypeScript, no
imports, no function names. Each scenario states: the input/precondition, the action, and
the expected observable outcome.

Cover every happy path, every edge case mentioned or implied, and every error/failure
condition. Write against observable behaviour only — never reference implementation details.

If the spec describes a structural/cleanup task with no runtime-observable behaviour
(e.g. deleting files, renaming types), do not invent test cases; add the note:
"No runtime tests — verified by `vue-tsc`."

End the file with `status: ready` as the last line.

## Pass 2 — After coding (writes `*.spec.ts`)

Read `[task-folder]/test-cases.md` and `[task-folder]/technical-specifications.md` (which
lists every file the implementer created or changed). Read each listed implementation file
to learn the exported API (function/composable/component names and paths).

Translate each scenario in `test-cases.md` into a Vitest `.spec.ts` test. Place test files
alongside source files or in `src/__tests__/`, following existing conventions. Import only
from paths confirmed to exist in the implementation files.

Do NOT:
- write tests for scenarios not in `test-cases.md`
- write `@ts-expect-error` tests, or tests whose only assertion is `toBeDefined()` on a
  value that cannot be undefined by construction (type correctness is `vue-tsc`'s job)
- assert presence/absence of files on disk or duplicate what `vue-tsc --build` catches
- use `node:fs`, `node:path`, or `__dirname`. The env is browser-like (happy-dom); load
  fixtures with Vite's `?raw` suffix:
  ```ts
  import fixtureHtml from '../../tests/fixtures/MY-FIXTURE.html?raw'
  ```

End your report with `status: ready`.

## Shell command retry limit

Do not run more than 3 failing shell commands in total. After 3 failures, stop and report
the full error output to the user.

## Next

- After **pass 1**:
  > Test cases ready. Run `/jli-git-commit @<task-folder>`, then (optionally `/clear` and)
  > `/jli-code @<task-folder>` to implement.
- After **pass 2**:
  > Test files written. Run `/jli-git-commit @<task-folder>`, then (optionally `/clear` and)
  > `/jli-test-run @<task-folder>` to run the suite.
