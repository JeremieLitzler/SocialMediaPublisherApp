#!/usr/bin/env bash
# scripts/pipeline/refresh-develop.sh
#
# Usage: bash scripts/pipeline/refresh-develop.sh
#
# Fetches all remote refs and fast-forwards the develop worktree to
# origin/develop. The develop worktree is located dynamically (by branch),
# so its folder name is never hardcoded. Run at the end of every cycle.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BARE_REPO="$(cd "$SCRIPT_DIR" && cd "$(git rev-parse --git-common-dir)" && pwd)"
DEVELOP="$(git -C "$BARE_REPO" worktree list --porcelain \
  | awk '/^worktree /{wt=$2} /^branch refs\/heads\/develop$/{print wt; exit}')"

if [ -z "$DEVELOP" ]; then
  echo "ERROR: could not locate the develop worktree." >&2
  exit 1
fi

echo "==> Fetching origin..."
git -C "$BARE_REPO" fetch origin

echo "==> Updating develop worktree at ${DEVELOP}..."
git -C "$DEVELOP" pull origin develop

echo "==> develop is up to date."
