#!/usr/bin/env bash
# scripts/pipeline/refresh-main.sh
#
# Usage: bash scripts/pipeline/refresh-main.sh
#
# Fetches all remote refs and fast-forwards the main worktree to
# origin/main. Call this at the end of every pipeline cycle to ensure
# the next pipeline starts from an up-to-date base.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BARE_REPO="$(cd "$SCRIPT_DIR/../../.." && pwd)"
MAIN_WT="${BARE_REPO}/main"

echo "==> Fetching origin..."
git -C "$BARE_REPO" fetch origin

echo "==> Updating main..."
git -C "$MAIN_WT" pull origin main

echo "==> main is up to date."
