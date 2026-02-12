# Task-004: Setup Vitest and Test useArticleState

## Context

Read before starting:

- `docs/prompts/system-prompt.md`
- `docs/prompts/workspace-context.md`
- `docs/decisions/ADR-005-testing-strategy.md`
- `src/composables/useArticleState.ts` (implementation to test)
- `src/types/article.ts` (types used in tests)

## Task

Setup Vitest testing infrastructure and write comprehensive unit tests for `useArticleState` composable.

## Relevant Specs

- `docs/decisions/ADR-005-testing-strategy.md` — Testing framework and conventions

## Acceptance Criteria

### Testing Infrastructure
- [ ] `vitest` installed as devDependency
- [ ] `@vue/test-utils` installed as devDependency
- [ ] `happy-dom` installed as devDependency
- [ ] `@vitest/ui` installed as devDependency (optional dev UI)
- [ ] `vitest.config.ts` created with Vue and TypeScript support
- [ ] Test script added to `package.json`: `"test": "vitest"`
- [ ] Test UI script added: `"test:ui": "vitest --ui"`
- [ ] Coverage script added: `"test:coverage": "vitest --coverage"`

### useArticleState Tests
- [ ] `src/composables/useArticleState.test.ts` created
- [ ] Test: Initial state is correct (idle, null article, null error, empty manualIntroduction)
- [ ] Test: State is reactive (changes propagate)
- [ ] Test: Singleton pattern works (multiple calls share same state)
- [ ] Test: State can be updated (status, article, error, manualIntroduction)
- [ ] Test: State persists across composable calls
- [ ] 100% coverage for `useArticleState.ts`

### Documentation
- [ ] Update system-prompt.md with testing conventions:
  - Co-locate tests with source files
  - Use `*.test.ts` naming
  - Run tests before commits
  - 100% coverage target for composables/utils

## Out of Scope

- Testing other composables or utils (future tasks)
- Component testing (no components implemented yet)
- E2E testing
- CI/CD integration

## After Completion

- [ ] Update `docs/prompts/workspace-context.md` (move task to Completed)
- [ ] Verify all tests pass: `npm run test`
- [ ] Verify coverage: `npm run test:coverage`
- [ ] No ADR needed (following ADR-005)
