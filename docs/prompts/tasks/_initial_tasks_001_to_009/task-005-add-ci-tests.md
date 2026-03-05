# Task-005: Add Test Step to CI Workflow

## Context

Read before starting:

- `docs/prompts/system-prompt.md`
- `docs/prompts/workspace-context.md`
- `docs/decisions/ADR-005-testing-strategy.md`
- `.github/workflows/pr-build.yml` (existing PR build workflow)

## Task

Add test execution step to the existing GitHub Actions PR build workflow to ensure all tests pass before PRs can be merged.

## Relevant Specs

- `docs/decisions/ADR-005-testing-strategy.md` — Testing strategy and requirements

## Acceptance Criteria

- [ ] Add "Run tests" step to `.github/workflows/pr-build.yml` after "Install dependencies"
- [ ] Test step runs `npm run test` (Vitest in CI mode - runs once and exits)
- [ ] Workflow fails if any tests fail
- [ ] Test step runs before build step (fail fast if tests fail)
- [ ] Optional: Add test coverage report as PR comment (future enhancement)
- [ ] Update workflow name if needed to reflect it now checks both tests and build

## Out of Scope

- Coverage reporting/uploading (can be added later)
- E2E tests (not implemented yet)
- Performance benchmarks
- Deployment workflows

## After Completion

- [ ] Update `docs/prompts/workspace-context.md` (move task to Completed)
- [ ] Verify workflow runs correctly (can be tested after PR is created)
- [ ] No ADR needed (follows existing CI/CD patterns)
