# Task-008: Implement Article Extraction Composable and Input UI

## Context

Read before starting:

- `docs/prompts/system-prompt.md`
- `docs/prompts/workspace-context.md`
- `docs/specs/01-requirements.md` (FR-1, FR-2)
- `docs/specs/02-architecture.md` (Data Flow, Application Structure)
- `docs/specs/03-data-models.md` (Article, ExtractionState)
- `src/types/article.ts`
- `src/composables/useArticleState.ts`
- `src/utils/htmlExtractor.ts`

## Task

Implement article extraction composable and basic input UI components to fetch, parse, and validate blog article content.

## Relevant Specs

- `docs/specs/01-requirements.md` FR-1, FR-2 — Article input and content extraction
- `docs/specs/02-architecture.md` — Data flow and component structure
- `docs/specs/03-data-models.md` — ExtractionState workflow

## Acceptance Criteria

### Composable Implementation

- [ ] `src/composables/useArticleExtractor.ts` created
- [ ] Function: `extractArticle(url: string)` — fetches HTML and extracts content
- [ ] Uses `fetch()` to get HTML from URL
- [ ] Uses `DOMParser` to parse HTML string into Document
- [ ] Uses all `htmlExtractor` functions to extract article data
- [ ] Updates `useArticleState` with extraction results
- [ ] Handles extraction states: 'idle' → 'loading' → 'success'/'error'/'missing-introduction'
- [ ] Validates introduction exists (if null, set status to 'missing-introduction')
- [ ] Returns extraction state for component use
- [ ] Handles CORS errors gracefully
- [ ] Handles network errors gracefully

### Input UI Components

- [ ] `src/components/article/ArticleInput.vue` created
- [ ] Input field for article URL
- [ ] Platform selection (radio buttons: X, LinkedIn, Medium, Substack)
- [ ] "Extract" button to trigger extraction
- [ ] Loading state during extraction
- [ ] Error display if extraction fails
- [ ] Uses shadcn-vue Button and Input components
- [ ] Responsive design

### Missing Introduction Handler

- [ ] `src/components/article/ManualIntroduction.vue` created
- [ ] Textarea for user to input introduction manually
- [ ] Shows when extractionState.status === 'missing-introduction'
- [ ] Updates extractionState.manualIntroduction on input
- [ ] "Continue" button to proceed with manual introduction
- [ ] Uses shadcn-vue Textarea component

### Testing

- [ ] `src/composables/useArticleExtractor.test.ts` created
- [ ] Mock fetch API for testing
- [ ] Test successful extraction flow
- [ ] Test missing introduction detection
- [ ] Test error handling (network errors, CORS)
- [ ] Test state transitions
- [ ] 100% coverage for useArticleExtractor.ts
- [ ] Component tests can be added in future task
- [ ] Run tests and verify all pass: `npm run test`
- [ ] Verify test coverage: `npm run test:coverage`

### Integration

- [ ] Update `src/pages/index.vue` to use ArticleInput component
- [ ] Show ManualIntroduction component conditionally
- [ ] Basic layout structure in place

## Out of Scope

- Platform-specific content generation (next task)
- Copy-to-clipboard functionality (next task)
- Platform components (PlatformX, PlatformLinkedIn, etc.)
- xFormatter utility (not needed yet)
- Snippets configuration (not needed yet)

## After Completion

- [ ] Run tests and verify all pass: `npm run test`
- [ ] Verify test coverage if applicable: `npm run test:coverage`
- [ ] Update `docs/prompts/workspace-context.md` (move task to Completed)
- [ ] Create ADR if any architectural decision was made
- [ ] Update relevant spec file if implementation revealed a gap or change
- [ ] Make the application builds using `source .bashrc && nb`. Fix issues, if any are returned in the build output.
