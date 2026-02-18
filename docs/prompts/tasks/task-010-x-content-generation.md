# Task-010: X (Twitter) Content Generation

## Context

Read before starting:

- `docs/prompts/system-prompt.md`
- `docs/prompts/workspace-context.md`
- `docs/specs/01-requirements.md` (FR-4)
- `docs/specs/03-data-models.md` (XContent)
- `src/types/article.ts` (Article, XContent, Platform)
- `src/composables/useArticleState.ts`
- `src/utils/utm.ts`
- `src/pages/index.vue`
- `src/components/article/ArticleInput.vue`
- `src/types/RouterPathEnum.ts`

## Task

Implement X (Twitter) content generation: split the article introduction into ≤280-character chunks, display each chunk with an individual copy button, and navigate the user to the `/x` page after successful extraction.

This task also establishes shared infrastructure (CopyButton component, HTML-to-text helper) reused by all subsequent platform tasks.

## Relevant Specs

- `docs/specs/01-requirements.md` FR-4 — X content generation rules
- `docs/specs/01-requirements.md` FR-3 — UTM tag generation
- `docs/specs/01-requirements.md` NFR-2 — Visual copy feedback

## Acceptance Criteria

### Shared Infrastructure

- [ ] `src/components/ui/CopyButton.vue` created
  - Accepts a `text: string` prop (the content to copy)
  - Accepts an optional `label: string` prop (button label, default: "Copy")
  - On click: copies `text` to clipboard via `useClipboard` from `@vueuse/core`
  - Briefly shows a "Copied!" label (≥1s) then reverts — visual feedback per NFR-2
  - Uses existing `Button` UI component

- [ ] `src/utils/htmlToText.ts` created
  - Single exported function: `htmlToText(html: string): string`
  - Strips all HTML tags and returns plain text
  - Collapses whitespace and trims
  - Used by both X and LinkedIn generators

### Navigation After Extraction

- [ ] `useArticleState.ts` updated to track selected platform:
  - Add `selectedPlatform: Platform | null` to `ExtractionState`
  - Default value: `null`
- [ ] `src/components/article/ArticleInput.vue` updated:
  - On successful extraction, store the selected platform in `extractionState.selectedPlatform`
  - Navigate to the platform's route after extraction succeeds:
    - X → `/x`
    - LinkedIn → `/linkedin`
    - Medium → `/medium`
    - Substack → `/substack`

### X Content Generator

- [ ] `src/utils/xContentGenerator.ts` created
- [ ] Exported function: `generateXContent(article: Article): XContent`
- [ ] Algorithm:
  1. Convert `article.introduction` HTML to plain text using `htmlToText()`
  2. Split plain text into sentences (split on `. `, `! `, `? `, preserving the punctuation)
  3. Build chunks: accumulate sentences until the next sentence would push the chunk over 280 chars — then start a new chunk
  4. Append `"\n\n⬇️"` between each chunk (this is the separator shown to the user)
  5. The last chunk (or only chunk if intro fits in 280 chars) appends:
     ```
     \n\n⬇️⬇️⬇️\n[UTM link]
     ```
     where UTM link = `generateUTMLink(article.url, 'X')`
  6. Return `{ chunks }` — the array of formatted chunk strings

- [ ] Edge cases:
  - A single sentence longer than 280 chars: include it as its own chunk (do not split mid-sentence)
  - Empty introduction: return `{ chunks: [] }`

### X Page Component

- [ ] `src/components/platforms/PlatformX.vue` created (display component)
- [ ] `src/pages/x.vue` created (page, delegates to `PlatformX.vue`)
- [ ] Reads `extractionState.article` from `useArticleState()`
- [ ] If no article (user landed directly without extraction): show a message and a link back to home
- [ ] Calls `generateXContent(article)` to produce content
- [ ] Displays each chunk in a `<pre>` or text block
- [ ] Each chunk has its own `<CopyButton>` with `text` = the chunk content
- [ ] Shows total chunk count (e.g., "3 chunks to post")
- [ ] "Start over" / back-to-home button

### Testing

- [ ] `src/utils/xContentGenerator.test.ts` created
- [ ] Test: introduction fits in one chunk → single chunk with UTM link appended
- [ ] Test: introduction splits across multiple chunks → each chunk ≤ 280 chars
- [ ] Test: `⬇️` separator between chunks, `⬇️⬇️⬇️\n[link]` at end of last chunk
- [ ] Test: single sentence >280 chars is its own chunk
- [ ] Test: HTML tags are stripped before chunking
- [ ] Test: empty introduction → `{ chunks: [] }`
- [ ] `src/utils/htmlToText.test.ts` created
- [ ] Test: strips tags, collapses whitespace, handles nested tags
- [ ] Run tests: `npm run test` — all pass

## Files to Create / Modify

| File | Action |
|------|--------|
| `src/utils/htmlToText.ts` | Create |
| `src/utils/htmlToText.test.ts` | Create |
| `src/utils/xContentGenerator.ts` | Create |
| `src/utils/xContentGenerator.test.ts` | Create |
| `src/components/ui/CopyButton.vue` | Create |
| `src/components/platforms/PlatformX.vue` | Create |
| `src/pages/x.vue` | Create |
| `src/composables/useArticleState.ts` | Modify (add selectedPlatform) |
| `src/components/article/ArticleInput.vue` | Modify (navigate after extraction) |
| `src/pages/index.vue` | Modify (remove placeholder text) |

## Out of Scope

- LinkedIn, Medium, Substack pages (separate tasks)
- Snippet configuration
- Image display

## After Completion

- [ ] Run tests and verify all pass: `npm run test`
- [ ] Build the app: `npm run build` — fix any TypeScript errors
- [ ] Update `docs/prompts/workspace-context.md` (move task to Completed)
- [ ] Commit on feature branch `feature/task-10-x-content-generation`
