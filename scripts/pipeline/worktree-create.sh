#!/usr/bin/env bash
# scripts/pipeline/worktree-create.sh
#
# Usage: bash scripts/pipeline/worktree-create.sh <type> <slug>
#
# Creates a git worktree for a new feature/fix branch, installs npm deps,
# and prints the absolute worktree path as "Worktree: <path>".
#
# Layout (isolated worktree): the bare repo and every worktree are siblings
# under one parent folder. The bare repo is discovered with
# `git rev-parse --git-common-dir`, so folder names are never hardcoded.
#
#   <parent>/<repo-name>.git              <- bare repo
#   <parent>/<repo-name>-develop          <- develop worktree (runs this script)
#   <parent>/<repo-name>_<type>-<slug>    <- worktree this script creates
#
# Branch is `<type>/<slug>`; the worktree folder is `<repo-name>_<type>-<slug>`.
#
# Prerequisites: run fetch-origin.sh before this script.

set -euo pipefail

TYPE="${1:?Usage: worktree-create.sh <type> <slug>}"
SLUG="${2:?Usage: worktree-create.sh <type> <slug>}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BARE_REPO="$(cd "$SCRIPT_DIR" && cd "$(git rev-parse --git-common-dir)" && pwd)"
WORKTREES_ROOT="$(dirname "$BARE_REPO")"
REPO_NAME="$(basename "$BARE_REPO" .git)"

WT_SLUG="${TYPE}-${SLUG}"
WT_NAME="${REPO_NAME}_${WT_SLUG}"
BRANCH="${TYPE}/${SLUG}"
WT_PATH="${WORKTREES_ROOT}/${WT_NAME}"

echo "==> Creating worktree '${WT_NAME}' on branch '${BRANCH}'..."
git -C "$BARE_REPO" worktree add "$WT_PATH" -b "$BRANCH" origin/develop

echo "==> Installing npm dependencies in ${WT_PATH}..."
(cd "$WT_PATH" && npm install --silent)

echo "Worktree: ${WT_PATH}"
