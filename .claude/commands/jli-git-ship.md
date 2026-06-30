Push, open the PR, merge, and clean up. Task folder: $ARGUMENTS

`$ARGUMENTS` must be the absolute task-folder path. If it is empty, stop and reply:

> Usage: `/jli-git-ship <task-folder>` — I need the absolute task-folder path.

Derive `[worktree]` from the argument (the substring before `/docs/prompts/tasks/`). Parse
the issue `[id]` from the task-folder name. Use the pipeline scripts; they resolve the bare
repo root automatically. This command is outward-facing and irreversible — honour the two
approval gates below.

## Step 1 — Push and open the PR

Confirm `[task-folder]/test-results.md` ends with `status: passed`. If not, stop and tell
the user to finish `/jli-test-run [task-folder]` first.

Derive the PR title from `business-specifications.md` (short imperative summary, ≤70 chars).
Write the PR body to a temp file: a summary of what changed and why, a test-plan checklist,
and `Closes #[id]`. Target branch is always `develop` — never `main`.

```bash
cat > /tmp/pr-body.md << 'EOF'
<body content here>
EOF

bash scripts/pipeline/pr-create.sh [worktree] "<title>" /tmp/pr-body.md
```

`pr-create.sh` pushes the branch and opens the PR against `develop`, printing `PR: <url>`.

**Approval gate 1:** before running `pr-create.sh`, show the user the proposed PR title and
body and ask for approval. If they decline, stop.

## Step 2 — Merge (after approval)

**Approval gate 2:** show the user the PR URL and ask for approval to merge. If they decline,
stop — the PR stays open for them to merge manually.

```bash
bash scripts/pipeline/pr-complete.sh <pr-url>
```

Merges with rebase and deletes the remote branch. Skips gracefully if already merged/closed.

## Step 3 — Clean up

```bash
bash scripts/pipeline/worktree-cleanup.sh [worktree]
bash scripts/pipeline/refresh-develop.sh
```

`worktree-cleanup.sh` removes the worktree, prunes stale entries, and deletes the local
branch. `refresh-develop.sh` fetches origin and fast-forwards `develop`. Both are safe to
re-run.

## Shell command retry limit

Do not run more than 3 failing shell commands in total. After 3 failures, stop and report
the full error output to the user.

## Next

> Feature shipped: PR merged, worktree cleaned up, `develop` updated. The chain is complete.
