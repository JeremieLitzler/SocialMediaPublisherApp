# Task-011: LinkedIn Content Generation

## Context

Read before starting:

- `docs/prompts/system-prompt.md`
- `docs/prompts/workspace-context.md`
- `docs/specs/01-requirements.md` (FR-5)
- `docs/specs/03-data-models.md` (LinkedInContent)
- `src/types/article.ts` (Article, LinkedInContent)
- `src/composables/useArticleState.ts`
- `src/utils/utm.ts`
- `src/utils/htmlToText.ts` (created in Task-010)
- `src/components/ui/CopyButton.vue` (created in Task-010)
- `src/pages/x.vue` (for reference on page structure)

## Prerequisites

Task-010 must be completed:
- `src/utils/htmlToText.ts` exists
- `src/components/ui/CopyButton.vue` exists
- Navigation-after-extraction is working

## Task

Implement LinkedIn content generation: compose the article introduction as plain text with a UTM link below it, display it in a single copyable block.

## Relevant Specs

- `docs/specs/01-requirements.md` FR-5 — LinkedIn content generation rules
- `docs/specs/01-requirements.md` FR-3 — UTM tag generation
- `docs/specs/01-requirements.md` NFR-2 — Visual copy feedback

## Acceptance Criteria

### LinkedIn Content Generator

- [ ] `src/utils/linkedInContentGenerator.ts` created
- [ ] Exported function: `generateLinkedInContent(article: Article): LinkedInContent`
- [ ] Algorithm:
  1. Convert `article.introduction` HTML to plain text using `htmlToText()`
  2. Generate UTM link: `generateUTMLink(article.url, 'LinkedIn')`
  3. Compose `body` string:
     ```
     [plain text introduction]

     ⬇️⬇️⬇️
     [UTM link]
     ```
  4. Return `{ body }`

### LinkedIn Page Component

- [ ] `src/components/platforms/PlatformLinkedIn.vue` created (display component)
- [ ] `src/pages/linkedin.vue` created (page, delegates to `PlatformLinkedIn.vue`)
- [ ] Reads `extractionState.article` from `useArticleState()`
- [ ] If no article: show message and link back to home
- [ ] Calls `generateLinkedInContent(article)`
- [ ] Displays the `body` in a text block (preserving line breaks)
- [ ] Single `<CopyButton>` copying the full `body` string
- [ ] "Start over" / back-to-home button

### Testing

- [ ] `src/utils/linkedInContentGenerator.test.ts` created
- [ ] Test: output contains the plain text introduction
- [ ] Test: output contains `⬇️⬇️⬇️`
- [ ] Test: output ends with UTM-tagged link (`utm_source=LinkedIn`)
- [ ] Test: HTML tags stripped from introduction
- [ ] Test: UTM link on its own line after the separator
- [ ] Run tests: `npm run test` — all pass

## Files to Create / Modify

| File | Action |
|------|--------|
| `src/utils/linkedInContentGenerator.ts` | Create |
| `src/utils/linkedInContentGenerator.test.ts` | Create |
| `src/components/platforms/PlatformLinkedIn.vue` | Create |
| `src/pages/linkedin.vue` | Create |

## Out of Scope

- Medium, Substack pages (separate tasks)
- Image display
- Hashtag generation

## After Completion

- [ ] Run tests and verify all pass: `npm run test`
- [ ] Build the app: `npm run build` — fix any TypeScript errors
- [ ] Update `docs/prompts/workspace-context.md` (move task to Completed)
- [ ] Commit on feature branch `feature/task-11-linkedin-content-generation`
