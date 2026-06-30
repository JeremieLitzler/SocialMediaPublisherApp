Commit the current phase's artifacts. Task folder: $ARGUMENTS

`$ARGUMENTS` is the task folder, given as a `@`-mention relative to the worktree root you
opened (e.g. `@docs/prompts/tasks/issue-<id>-<slug>`). If it is empty, stop and reply:

> Usage: `/jli-git-commit @<task-folder>` — open the feature worktree (`code <worktree>`)
> first, then pass the task folder relative to it.

Run all git commands from the worktree root (your current directory) — never from the bare
repo root, and never commit directly to `develop` or `main` (you are on the feature branch
the worktree created). Parse the issue `[id]` from the task-folder name (`issue-<id>-<slug>`).

## What this command does

This is the commit step run between phases. Inspect what changed, then create one
conventional commit with the matching type. Use `rtk` for all git commands.

```bash
rtk git status
```

## Choosing the commit type from what changed

Stage and commit the changed files with the message that matches them:

| Changed files | Commit message |
|---|---|
| only `business-specifications.md` | `feat(specs): define specs for <short desc> (#[id])` |
| only `security-guidelines.md` | `feat(security): add security guidelines for <short desc> (#[id])` |
| only `test-cases.md` | `test(cases): define test scenarios for <short desc> (#[id])` |
| source files + `technical-specifications.md` (+ `review-results.md`) | implementation message summarising the change from `business-specifications.md` |
| `*.spec.ts` test files | `test: add tests for <short desc> (#[id])` |
| `test-results.md` | `test: record test results for <short desc> (#[id])` |

General conventional-commit rules: subject in imperative mood, lowercase, no period,
≤72 chars; put overflow in the body. Other file classes: `.claude/deprecated-agents`,
`CLAUDE.md`, or `.claude/settings.local.json` → `ci(agent): …`; `.claude/commands/jli-*.md`
→ `ci(commands): …`; other `docs/` files → `docs: …`; `.github/workflows` → `ci: …`.

Stage only the files belonging to the current phase, then:

```bash
rtk git add <files>
rtk git commit -m "<message>"
```

Do NOT push here — `/jli-git-ship` pushes.

## Bug discovery rule

If you discover a bug or code issue while committing, do NOT fix it here. Stop, describe the
bug, the file(s) affected, and the root cause, and tell the user to route it through
`/jli-code @<task-folder>`.

## Shell command retry limit

Do not run more than 3 failing shell commands in total. After 3 failures, stop and report
the full error output to the user.

## Next

Report the commit. Then point the user to the next phase based on what was just committed:

- after specs → `/jli-security @<task-folder>`
- after security → `/jli-test-write @<task-folder>` (pass 1)
- after test-cases → `/jli-code @<task-folder>`
- after code/review (approved) → `/jli-test-write @<task-folder>` (pass 2)
- after review (changes requested) → `/jli-code @<task-folder>`
- after `*.spec.ts` → `/jli-test-run @<task-folder>`
- after test-results (passed) → `/jli-git-ship @<task-folder>`
- after test-results (failed) → `/jli-code @<task-folder>`

> Committed. You may run `/clear` before the next command.
