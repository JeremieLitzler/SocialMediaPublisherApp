#!/usr/bin/env bash
# scripts/pipeline/refresh-main.sh
#
# Usage: bash scripts/pipeline/refresh-main.sh
#
# Fetches all remote refs and fast-forwards the main worktree to
# origin/main. The main worktree is located dynamically (by branch),
# so its folder name is never hardcoded. Run at the end of every cycle.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BARE_REPO="$(cd "$SCRIPT_DIR" && cd "$(git rev-parse --git-common-dir)" && pwd)"
MAIN_WT="$(git -C "$BARE_REPO" worktree list --porcelain \
  | awk '/^worktree /{wt=$2} /^branch refs\/heads\/main$/{print wt; exit}')"

if [[ -z "$MAIN_WT" ]]; then
  echo "ERROR: could not locate the main worktree." >&2
  exit 1
fi

echo "==> Fetching origin..."
git -C "$BARE_REPO" fetch origin

echo "==> Updating main worktree at ${MAIN_WT}..."
git -C "$MAIN_WT" pull origin main

echo "==> main is up to date."
