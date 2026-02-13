# Task-006: Implement HTML Extractor Utility

## Context

Read before starting:

- `docs/prompts/system-prompt.md`
- `docs/prompts/workspace-context.md`
- `docs/specs/01-requirements.md` (FR-2: Content Extraction)
- `docs/specs/02-architecture.md` (Article Extraction Rules)
- `docs/specs/03-data-models.md` (Article interface)
- `src/types/article.ts` (Article type to populate)

## Task

Implement pure utility functions in `src/utils/htmlExtractor.ts` to parse HTML and extract article content using DOM selectors.

## Relevant Specs

- `docs/specs/01-requirements.md` FR-2 — Content extraction selectors
- `docs/specs/02-architecture.md` — Source HTML structure
- `docs/specs/03-data-models.md` — Article data shape

## Acceptance Criteria

### Implementation

- [ ] `src/utils/htmlExtractor.ts` created with pure functions (no Vue dependencies)
- [ ] Function: `extractTitle(doc: Document): string` — extract from `.article-title a`
- [ ] Function: `extractDescription(doc: Document): string` — extract from `.article-subtitle`
- [ ] Function: `extractImageUrl(doc: Document): string` — extract from `.article-image a img`
- [ ] Function: `extractImageAlt(doc: Document): string` — extract alt text from featured image
- [ ] Function: `extractIntroduction(doc: Document): string` — extract all `<p>` tags before first `<h2>` in `.article-content`, return as HTML string. If a `<h2>` is found, return null.
- [ ] Function: `extractCategories(doc: Document): string` — extract from `<header class="article-category">` all `<a>` text contents
- [ ] Function: `extractTags(doc: Document): string[]` — extract from `<section class="article-tags">` all `<a>` text contents
- [ ] Function: `extractFollowMeSnippet(doc: Document): string` — extract from second-to-last child of `.article-content`
- [ ] Function: `extractImageCredit(doc: Document): string | null` — extract from last `<p>` in `.article-content` if starts with "Photo by"/"Photo de", otherwise null
- [ ] Function: `detectBlog(url: string): Blog` — detect 'english' if domain is `iamjeremie.me`, 'french' if `jeremielitzler.fr`
- [ ] All functions handle missing elements gracefully (return empty string/array, not throw)
- [ ] TypeScript types for all parameters and returns

### Testing

Using this real life example for testing: 
- in English: `https://iamjeremie.me/post/2026-01/manage-dependencies-with-github-actions/`
- In French: `https://jeremielitzler.fr/post/2026-01/gerer-ses-dependencies-avec-github-actions/`

To test the "no introduction" usecase, use this real life example and remove the introduction.

To test the "no image credit" usecase, use this real life example: 
- In English: `https://iamjeremie.me/post/2025-12/devops-best-practices-a-example-with-azure-devops/`.
- in French: `https://jeremielitzler.fr/post/2025-12/bonnes-pratique-devops-un-exemple-avec-azure-devops/`

Download a local copy from online URL for all usecases to guarantee consistancy in results. It is one time action.

- [ ] `src/utils/htmlExtractor.test.ts` created
- [ ] Test each function with valid HTML
- [ ] Test each function with missing elements (graceful degradation)
- [ ] Test `detectBlog` with both English and French domains
- [ ] Test introduction extraction with multiple paragraphs
- [ ] Test image credit detection with both languages and non-credit paragraphs
- [ ] 100% coverage for htmlExtractor.ts
- [ ] Run tests and verify all pass: `npm run test`
- [ ] Verify test coverage: `npm run test:coverage`

### Documentation

- [ ] JSDoc comments for each exported function
- [ ] Document expected HTML structure in file header

## Out of Scope

- Fetching HTML from URLs (that goes in composable)
- Validation logic beyond null checks
- Image caption extraction (not in spec)
- Any Vue-specific code or state management

## After Completion

- [ ] Run tests and verify all pass: `npm run test`
- [ ] Verify test coverage if applicable: `npm run test:coverage`
- [ ] Update `docs/prompts/workspace-context.md` (move task to Completed)
- [ ] Create ADR if any architectural decision was made
- [ ] Update relevant spec file if implementation revealed a gap or change
- [ ] Make the application builds using `source .bashrc && nb`. Fix issues, if any are returned in the build output.
