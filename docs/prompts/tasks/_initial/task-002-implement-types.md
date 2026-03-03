# Task-002: Implement Article Type Definitions

## Context

Read before starting:

- `docs/prompts/system-prompt.md`
- `docs/prompts/workspace-context.md`
- `docs/specs/00-overview.md`
- `docs/specs/02-architecture.md`
- `docs/specs/03-data-models.md`
- `docs/specs/01-requirements.md` (FR-2 for extraction fields)

## Task

Implement TypeScript type definitions for article data and platform content in `src/types/article.ts`.

## Relevant Specs

- `docs/specs/03-data-models.md` — Complete type definitions
- `docs/specs/01-requirements.md` FR-2 — Content extraction fields

## Acceptance Criteria

- [ ] `src/types/article.ts` created with all core types defined
- [ ] `ArticleURL` type defined (string alias)
- [ ] `Blog` type defined ('english' | 'french')
- [ ] `Platform` type defined ('X' | 'LinkedIn' | 'Medium' | 'Substack')
- [ ] `Article` interface defined with all properties from data model spec
- [ ] `ExtractionStatus` type defined (idle | loading | missing-introduction | success | error)
- [ ] `ExtractionState` interface defined
- [ ] Platform content interfaces defined: `XContent`, `LinkedInContent`, `MediumContent`, `SubstackContent`
- [ ] `UTMParams` interface defined
- [ ] All types exported for use in composables and components
- [ ] JSDoc comments added to clarify nullable fields and extraction sources
- [ ] No implementation logic — types only

## Out of Scope

- Any implementation of extraction logic
- Composables or utilities
- Components or UI
- Validation functions

## After Completion

- [ ] Update `docs/prompts/workspace-context.md` (move task to Completed)
- [ ] Verify app builds with `npm run type-check`
- [ ] No ADR needed (following existing type-first convention)
