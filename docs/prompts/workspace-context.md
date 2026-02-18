# Workspace Context

## Current Phase

🔄 Content generation — platform-specific content generators

## Completed

- [x] TR-1: Codebase cleanup (remove unused boilerplate dependencies)
- [x] Task-002: Implement `src/types/article.ts`
- [x] Task-003: Implement `src/composables/useArticleState.ts`
- [x] Task-004: Setup Vitest and write tests for `useArticleState.ts`
- [x] Task-005: Add test step to CI workflow
- [x] Task-006: Implement `src/utils/htmlExtractor.ts`
- [x] Task-007: Implement `src/utils/utm.ts`
- [x] Task-008: Article extraction composable + ArticleInput / ManualIntroduction UI
- [x] Task-009: Netlify Functions backend proxy for CORS-free HTML fetching

## In Progress

- [ ] nothing currently

## Up Next

- [ ] Task-010: X (Twitter) content generation
- [ ] Task-011: LinkedIn content generation
- [ ] Task-012: Medium content generation
- [ ] Task-013: Substack content generation

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
- Backend proxy: HTML fetching goes via Netlify Function (`/.netlify/functions/fetch-article`), not direct client-side fetch — see ADR-006
