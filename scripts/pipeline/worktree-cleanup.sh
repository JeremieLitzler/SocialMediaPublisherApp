#!/usr/bin/env bash
# scripts/pipeline/worktree-cleanup.sh
#
# Usage: bash scripts/pipeline/worktree-cleanup.sh <worktree>
#
# Removes a feature worktree, prunes stale git entries, and deletes its
# local branch. Safe to re-run if a prior attempt was partial.
#
# <worktree> may be an absolute path OR just the worktree folder name
# (resolved against the parent of the bare repo).
#
# IMPORTANT: run this from the develop worktree, never from inside the
# worktree being removed. Follow with refresh-develop.sh.

set -euo pipefail

WORKTREE_ARG="${1:?Usage: worktree-cleanup.sh <worktree>}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BARE_REPO="$(cd "$SCRIPT_DIR" && cd "$(git rev-parse --git-common-dir)" && pwd)"
WORKTREES_ROOT="$(dirname "$BARE_REPO")"

# Resolve a bare folder name to a path under the worktrees root.
case "$WORKTREE_ARG" in
  /* | [A-Za-z]:* | */*) WORKTREE="$WORKTREE_ARG" ;;
  *) WORKTREE="${WORKTREES_ROOT}/${WORKTREE_ARG}" ;;
esac
# Absolutize when the directory still exists.
WORKTREE="$( (cd "$WORKTREE" 2>/dev/null && pwd) || echo "$WORKTREE" )"
WT_NAME="$(basename "$WORKTREE")"

# Read the branch name BEFORE the worktree is removed. Prefer the worktree
# metadata from `worktree list`, which still reports the branch even when the
# working directory is already gone (a 'prunable' worktree). Fall back to
# reading it from inside the worktree if metadata has no branch (e.g. detached).
BRANCH="$(git -C "$BARE_REPO" worktree list --porcelain | awk -v name="$WT_NAME" '
  /^worktree / { wt = substr($0, 10); sub(/.*\//, "", wt); is_match = (wt == name) }
  is_match && /^branch / { br = substr($0, 8); sub(/^refs\/heads\//, "", br); print br; exit }
')"
if [[ -z "$BRANCH" ]]; then
  BRANCH="$(git -C "$WORKTREE" branch --show-current 2>/dev/null || true)"
fi

echo "==> Removing worktree '${WT_NAME}'..."
git -C "$BARE_REPO" worktree remove --force "$WORKTREE" 2>/dev/null || true
if [[ -d "$WORKTREE" ]]; then
  rm -rf "$WORKTREE"
fi

echo "==> Pruning stale worktree entries..."
git -C "$BARE_REPO" worktree prune

if [[ -n "$BRANCH" ]]; then
  echo "==> Deleting local branch '${BRANCH}'..."
  # Use -D (force) because GitHub rebase/squash-merge does not create a merge
  # commit, so git never considers the local branch "fully merged".
  git -C "$BARE_REPO" branch -D "$BRANCH" 2>/dev/null || true
fi

echo "==> Worktree '${WT_NAME}' cleaned up."
