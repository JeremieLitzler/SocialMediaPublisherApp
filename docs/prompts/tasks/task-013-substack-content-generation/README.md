# Task-013: Substack Content Generation

## Context

Read before starting:

- `docs/prompts/system-prompt.md`
- `docs/prompts/workspace-context.md`
- `docs/specs/01-requirements.md` (FR-7, FR-8)
- `docs/specs/03-data-models.md` (SubstackContent)
- `src/types/article.ts` (Article, SubstackContent, Blog)
- `src/composables/useArticleState.ts`
- `src/utils/utm.ts`
- `src/components/ui/CopyButton.vue` (created in Task-010)
- `src/utils/mediumContentGenerator.ts` (Task-012, for reference on HTML body pattern)
- `src/pages/medium.vue` (for reference on page structure)

## Prerequisites

Task-010 must be completed:
- `src/components/ui/CopyButton.vue` exists
- Navigation-after-extraction is working

## Task

Implement Substack content generation: produce all fields required to manually create a Substack cross-post — title, description, a ready-to-paste HTML body (with attribution and share block), category, and tags — each with individual copy buttons.

## Relevant Specs

- `docs/specs/01-requirements.md` FR-7 — Substack content fields and HTML body structure
- `docs/specs/01-requirements.md` FR-8 — Substack share block text (bilingual)
- `docs/specs/01-requirements.md` FR-3 — UTM tag generation
- `docs/specs/01-requirements.md` NFR-2 — Visual copy feedback

## Acceptance Criteria

### Predefined Snippets (Bilingual)

These values are read from `src/config/snippets.ts` (shared with Task-012). Add Substack-specific entries if the file does not already contain them.

**Attribution line** (italic text at end of body):
- English: `Originally published on iamjeremie.me`
- French: `Originallement publiée sur jeremielitzler.fr.`

**Share block text:**
- English: `Thanks for reading my publication! This post is public so feel free to share it.`
- French: `Merci pour votre intérêt pour ma publication ! Cet article est public, n'hésitez pas à le partager.`

Language determined by `article.blog` (`'english'` → EN, `'french'` → FR).

### Substack Content Generator

- [ ] `src/utils/substackContentGenerator.ts` created
- [ ] Exported function: `generateSubstackContent(article: Article): SubstackContent`
- [ ] Builds the following fields:
  - `title`: `article.title`
  - `description`: `article.description`
  - `category`: `article.category`
  - `tags`: `article.tags`
  - `bodyHtml`: assembled HTML string (see structure below)

- [ ] `bodyHtml` structure (in order):
  ```html
  <figure>
    <img src="[article.imageUrl]" alt="[article.imageAlt]" />
    [if article.imageCreditSnippet is not null:
      <figcaption>[plain text from imageCreditSnippet]</figcaption>
    ]
  </figure>
  [article.introduction as-is (already HTML)]
  <p>⬇️⬇️⬇️<br /><a href="[UTM link]">[UTM link]</a></p>
  <p><em>[attribution line (EN or FR)]</em></p>
  <p>[share block text (EN or FR)]</p>
  ```
  - UTM link = `generateUTMLink(article.url, 'Substack')`
  - Omit `<figcaption>` entirely if `article.imageCreditSnippet` is null
  - Plain text for caption: strip HTML tags from `article.imageCreditSnippet`

### Substack Page Component

- [ ] `src/components/platforms/PlatformSubstack.vue` created (display component)
- [ ] `src/pages/substack.vue` created (page, delegates to `PlatformSubstack.vue`)
- [ ] Reads `extractionState.article` from `useArticleState()`
- [ ] If no article: show message and link back to home
- [ ] Calls `generateSubstackContent(article)`
- [ ] Displays a labelled row for each field with a `<CopyButton>`:
  - **Title** — copies `title`
  - **Description** — copies `description`
  - **Category** — copies `category`
  - **Tags** — one `<CopyButton>` per tag
  - **Body HTML** — copies `bodyHtml`; display as `<pre>` or `<textarea readonly>` for visual verification
- [ ] "Start over" / back-to-home button

### Testing

- [ ] `src/utils/substackContentGenerator.test.ts` created
- [ ] Test: `title`, `description`, `category` mapped directly from article
- [ ] Test: `bodyHtml` contains `<img src="...">` with correct src and alt
- [ ] Test: `bodyHtml` contains `<figcaption>` when credit present; omits it when null
- [ ] Test: `bodyHtml` contains introduction HTML verbatim
- [ ] Test: `bodyHtml` UTM link has `utm_source=Substack`
- [ ] Test: `bodyHtml` contains EN attribution for English article
- [ ] Test: `bodyHtml` contains FR attribution for French article
- [ ] Test: `bodyHtml` contains EN share text for English article
- [ ] Test: `bodyHtml` contains FR share text for French article
- [ ] Test: attribution line wrapped in `<em>` tags
- [ ] Test: `tags` array passed through unchanged
- [ ] Run tests: `npm run test` — all pass

## Files to Create / Modify

| File | Action |
|------|--------|
| `src/utils/substackContentGenerator.ts` | Create |
| `src/utils/substackContentGenerator.test.ts` | Create |
| `src/config/snippets.ts` | Modify (add Substack snippets) |
| `src/components/platforms/PlatformSubstack.vue` | Create |
| `src/pages/substack.vue` | Create |

## Out of Scope

- Scheduling logic (noon publication time noted in FR-7 but manual step)
- Actual Substack API integration
- User-editable snippet configuration

## After Completion

- [ ] Run tests and verify all pass: `npm run test`
- [ ] Build the app: `npm run build` — fix any TypeScript errors
- [ ] Update `docs/prompts/workspace-context.md` (move task to Completed)
- [ ] Commit on feature branch `feature/task-13-substack-content-generation`
