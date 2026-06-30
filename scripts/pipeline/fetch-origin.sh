#!/usr/bin/env bash
# scripts/pipeline/fetch-origin.sh
#
# Usage: bash scripts/pipeline/fetch-origin.sh [bare-repo-path]
#
# Ensures the bare repo has `origin` configured with the correct fetch
# refspec, then fetches all remote refs.
#
# The bare repo is discovered with `git rev-parse --git-common-dir` from
# this script's own worktree, so folder names are never hardcoded.
#
# Called automatically by worktree-create.sh. Run standalone when only
# a fetch is needed.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEFAULT_BARE="$(cd "$SCRIPT_DIR" && cd "$(git rev-parse --git-common-dir)" && pwd)"
BARE_REPO="${1:-$DEFAULT_BARE}"

# Ensure origin remote exists; if not, infer the URL from the develop worktree.
if ! git -C "$BARE_REPO" remote get-url origin &>/dev/null; then
  DEVELOP="$(git -C "$BARE_REPO" worktree list --porcelain \
    | awk '/^worktree /{wt=$2} /^branch refs\/heads\/develop$/{print wt; exit}')"
  REMOTE_URL=""
  if [[ -n "$DEVELOP" ]]; then
    REMOTE_URL="$(git -C "$DEVELOP" remote get-url origin 2>/dev/null || true)"
  fi
  if [[ -z "$REMOTE_URL" ]]; then
    echo "ERROR: origin remote not found in bare repo and could not be inferred." >&2
    echo "Run: git -C \"$BARE_REPO\" remote add origin <url>" >&2
    exit 1
  fi
  git -C "$BARE_REPO" remote add origin "$REMOTE_URL"
fi

# Ensure full refspec so remote-tracking refs stay current
git -C "$BARE_REPO" config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
git -C "$BARE_REPO" fetch origin

echo "==> origin fetched (bare repo: $BARE_REPO)"
