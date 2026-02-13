# Task-007: Implement UTM Tag Generator Utility

## Context

Read before starting:

- `docs/prompts/system-prompt.md`
- `docs/prompts/workspace-context.md`
- `docs/specs/01-requirements.md` (FR-3: UTM Tag Generation)
- `docs/specs/02-architecture.md` (UTM Tag Rules)
- `docs/specs/03-data-models.md` (UTMParams interface)
- `src/types/article.ts` (UTMParams and Platform types)

## Task

Implement pure utility function in `src/utils/utm.ts` to generate UTM-tagged URLs for tracking social media traffic.

## Relevant Specs

- `docs/specs/01-requirements.md` FR-3 — UTM tag requirements
- `docs/specs/02-architecture.md` — UTM Tag Rules table
- `docs/specs/03-data-models.md` — UTMParams interface

## Acceptance Criteria

### Implementation

- [ ] `src/utils/utm.ts` created with pure function (no Vue dependencies)
- [ ] Function: `generateUTMLink(url: string, platform: Platform): string`
- [ ] Function accepts base article URL and platform name
- [ ] Function returns URL with UTM parameters appended
- [ ] All links include `utm_medium=social`
- [ ] Platform-specific `utm_source` values:
  - X: `utm_source=X`
  - LinkedIn: `utm_source=LinkedIn`
  - Medium: `utm_source=Medium`
  - Substack: `utm_source=Substack`
- [ ] Handle URLs that already have query parameters (append with `&`)
- [ ] Handle URLs without query parameters (append with `?`)
- [ ] Preserve existing URL structure (path, hash, etc.)
- [ ] TypeScript types for all parameters and returns
- [ ] JSDoc comments explaining function purpose

### Testing

- [ ] `src/utils/utm.test.ts` created
- [ ] Test URL without existing query params: `https://example.com/article`
- [ ] Test URL with existing query params: `https://example.com/article?lang=en`
- [ ] Test URL with hash fragment: `https://example.com/article#section`
- [ ] Test URL with both query params and hash: `https://example.com/article?lang=en#section`
- [ ] Test all 4 platforms (X, LinkedIn, Medium, Substack)
- [ ] Test that utm_medium is always 'social'
- [ ] Test that utm_source matches platform name
- [ ] 100% coverage for utm.ts
- [ ] Run tests and verify all pass: `npm run test`
- [ ] Verify test coverage: `npm run test:coverage`

### Documentation

- [ ] JSDoc comments for exported function
- [ ] Document UTM parameter format in file header

## Out of Scope

- Campaign tracking (utm_campaign)
- Custom UTM parameters
- URL validation or sanitization
- Shortening URLs

## After Completion

- [ ] Run tests and verify all pass: `npm run test`
- [ ] Verify test coverage if applicable: `npm run test:coverage`
- [ ] Update `docs/prompts/workspace-context.md` (move task to Completed)
- [ ] Create ADR if any architectural decision was made
- [ ] Update relevant spec file if implementation revealed a gap or change
- [ ] Make the application builds using `source .bashrc && nb`. Fix issues, if any are returned in the build output.
