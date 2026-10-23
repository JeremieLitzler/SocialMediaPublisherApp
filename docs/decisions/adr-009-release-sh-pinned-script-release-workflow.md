# ADR-009: Pinned External `release.sh`, Single-Trunk Push-Triggered Release

**Date:** 2026-10-23
**Status:** Accepted

## Context

ADR-004 chose `semantic-release` (npm-based, run on push to `main` with a GitHub App token) for versioning. It pulls five npm packages into the dependency tree, needs a GitHub App and its secrets to push to protected branches, commits generated files back to the repository, and its last run failed (issue #122).

The release logic now lives in its own repository, [semantic-release-script](https://github.com/JeremieLitzler/semantic-release-script), as `release.sh`, tagged `v1.0.0`. It already runs in [deadlinkprobe](https://github.com/JeremieLitzler/deadlinkprobe/blob/main/.github/workflows/release.yml) from a pinned SHA without any local modification. This ADR adopts the same model here, with `main` as the trunk.

## Decision

`.github/workflows/release.yml` downloads `release.sh` at a pinned commit SHA (`RELEASE_SCRIPT_REF`, tag `v1.0.0`) at run time and runs that copy, never the copy on the commit being released. The SHA is pinned rather than the tag, since a tag can be moved. Moving the pin is a reviewed commit.

The release model is single-trunk and push-triggered:

- `main` is the only long-lived branch; changes land by pull request, checked by `pr-build.yml`.
- A push to `main` previews the release (`release.sh --dry-run`, written to the run summary).
- A release is cut by pushing a `release/<date>` branch off `main`; that runs the `publish` job (tag + GitHub release), which then deletes the spent `release/*` branch. The `guard` job refuses any ref but `main` or `release/*`.
- Publish runs on `GITHUB_TOKEN` (`contents: write`). The GitHub App token and the `semantic-release` action are gone.
- A `test` job (`npm ci`, `npm audit signatures`, `npm run test`, `npm run build`) gates `publish`.
- A `deploy-site` job calls `NETLIFY_BUILD_HOOK` after a release is cut, kept separate so a Netlify outage never turns a published release red.
- Production is deployed by that build hook only. `netlify.toml` skips any production build not started by the hook (`CONTEXT` is `production` and `INCOMING_HOOK_TITLE` is empty), while deploy previews and branch deploys still build.
- The version is left to the commits; no level is forced.
- The `semantic-release` configuration, its helper script, the generated history file and the five `semantic-release` npm packages are removed. The GitHub releases hold the history.

This supersedes ADR-004.

## Consequences

### Positive

- No `semantic-release` dependency chain to keep patched; no GitHub App or its secrets to provision.
- No local copy of the script to sync: it is used unmodified from upstream.
- A bug in a commit cannot break its own release, since the script is not taken from that commit.
- A release cannot be published with a failing test or build.
- A merge to `main` no longer deploys production: a release is a deliberate act.

### Negative

- Every run depends on `raw.githubusercontent.com` and the upstream repository being reachable.
- Trust moves to the upstream repository: the pin must be moved by a deliberate, reviewed change, because the script runs unattended with `--yes`.
- `release/**` is unprotected: anyone who can push to the repository can cut a release. The publish job's containment check (the ref must be contained in `main`) and the optional required reviewer on the `CI` environment are the only gates.
- A release created with `GITHUB_TOKEN` triggers no further workflow; any future `on: release` or `on: push: tags` automation must restore an App or PAT token first.
- No history file in the repository any more; release notes live on the GitHub releases page.

## Alternatives Considered

- **Keep `semantic-release` (ADR-004)**: rejected; heavier toolchain, App token to maintain, and the current pipeline is broken (#122).
- **Vendor `release.sh` in the repository**: rejected; every upstream fix would need a reviewed re-sync.
- **Pin the tag name instead of the SHA**: rejected; a tag can be moved, a SHA cannot.
- **Let every push to `main` deploy production**: rejected; production is deployed by the release build hook only.

## Notes

- Implemented by issues #142 to #146.
- Modelled on ADR-017 of the french-gas-stations-scraper repository.
