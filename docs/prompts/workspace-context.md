# Workspace Context

## Current Phase

✅ Setup — codebase cleanup (TR-1) completed

## Completed

- [x] TR-1: Codebase cleanup (remove unused boilerplate dependencies)

## In Progress

- [ ] nothing currently

## Up Next

- [ ] Implement `src/types/article.ts`
- [ ] Implement `src/composables/useArticleState.ts`
- [ ] Implement `src/utils/htmlExtractor.ts`
- [ ] Implement `src/utils/utm.ts`
- [ ] Implement URL input + extraction UI

## Open Decisions

- None currently

## Recent ADRs

| ADR     | Title                                 | Date       |
| ------- | ------------------------------------- | ---------- |
| ADR-001 | Vue 3 as Frontend Framework           | 2026-02-11 |
| ADR-002 | Singleton Composable for Shared State | 2026-02-11 |
| ADR-003 | Tailwind CSS v4 + shadcn-vue for UI   | 2026-02-11 |
| ADR-004 | Semantic Release for Versioning       | 2026-02-11 |

## Known Spec Gaps

- None currently

## Notes for Claude Code

- This is a bilingual app (EN/FR blogs) — always consider both languages
- Medium does NOT accept full HTML paste — image must be handled separately
- Substack DOES accept full HTML paste — image included in bodyHtml
- No backend — all extraction happens client-side via fetch + DOM parsing
