# Task-003: Implement Article State Composable

## Context

Read before starting:

- `docs/prompts/system-prompt.md`
- `docs/prompts/workspace-context.md`
- `docs/specs/02-architecture.md` (Data Flow section)
- `docs/decisions/ADR-002-state-management.md`
- `docs/specs/03-data-models.md` (ExtractionState type)
- `src/types/article.ts` (already implemented)

## Task

Implement singleton composable for shared article extraction state in `src/composables/useArticleState.ts`.

## Relevant Specs

- `docs/specs/02-architecture.md` — Data flow and composable structure
- `docs/decisions/ADR-002-state-management.md` — Singleton composable pattern
- `docs/specs/03-data-models.md` — ExtractionState interface

## Acceptance Criteria

- [ ] `src/composables/useArticleState.ts` created
- [ ] Module-level `ref<ExtractionState>` declared outside the composable function
- [ ] Initial state: `{ status: 'idle', article: null, error: null, manualIntroduction: '' }`
- [ ] Composable function returns reactive state object
- [ ] Follows singleton pattern from ADR-002 (shared across all consumers)
- [ ] Imports types from `src/types/article.ts`
- [ ] No extraction logic — state management only
- [ ] JSDoc comments explaining singleton pattern

## Out of Scope

- Article extraction logic (that goes in `useArticleExtractor.ts`)
- HTML parsing (that goes in `src/utils/htmlExtractor.ts`)
- UTM generation (that goes in `src/utils/utm.ts`)
- UI components

## After Completion

- [ ] Update `docs/prompts/workspace-context.md` (move task to Completed)
- [ ] Verify app builds with `npm run type-check`
- [ ] No ADR needed (following existing ADR-002 pattern)
