# Workspace Context

## Current Phase

✅ Setup — codebase cleanup (TR-1) completed

## Completed

- [x] TR-1: Codebase cleanup (remove unused boilerplate dependencies)
- [x] Task-002: Implement `src/types/article.ts`
- [x] Task-003: Implement `src/composables/useArticleState.ts`
- [x] Task-004: Setup Vitest and write tests for `useArticleState.ts`
- [x] Task-005: Add test step to CI workflow
- [x] Task-006: Implement `src/utils/htmlExtractor.ts`

## In Progress

- [ ] nothing currently

## Up Next

- [ ] Implement `src/utils/utm.ts`
- [ ] Implement URL input + extraction UI

## Open Decisions

- None currently

## Recent ADRs

See [ADR Index](../decisions/README.md)

## Known Spec Gaps

- None currently

## Notes for Claude Code

- This is a bilingual app (EN/FR blogs) — always consider both languages
- Medium does NOT accept full HTML paste — image must be handled separately
- Substack DOES accept full HTML paste — image included in bodyHtml
- No backend — all extraction happens client-side via fetch + DOM parsing
