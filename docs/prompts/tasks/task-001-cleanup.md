# TR-1: Codebase Cleanup

## Context

Read before starting:

- `docs/prompts/system-prompt.md`
- `docs/prompts/workspace-context.md`
- `docs/specs/01-requirements.md` (TR-1)
- `docs/decisions/ADR-002-state-management.md`
- `docs/decisions/ADR-003-ui-layer.md`

## Task

Remove all unused boilerplate dependencies and files before
feature development begins.

## Relevant Specs

- `docs/specs/01-requirements.md` TR-1

## Acceptance Criteria

- [ ] `pinia` removed from dependencies and all store files deleted
- [ ] `@tanstack/vue-table` removed from dependencies
- [ ] `@faker-js/faker` removed from dependencies
- [ ] Supabase-related config, components, and types deleted
- [ ] Vue Router reduced to a single route (HomeView)
- [ ] App compiles and runs with no errors after cleanup
- [ ] No new features added in this task

## Out of Scope

- Any new feature implementation
- Changes to existing UI components not related to cleanup

## After Completion

- [ ] Update `docs/prompts/workspace-context.md`
- [ ] Run `npm install` to sync lockfile after dependency removals
