# Task-012: Medium Content Generation

## Context

Read before starting:

- `docs/prompts/system-prompt.md`
- `docs/prompts/workspace-context.md`
- `docs/specs/01-requirements.md` (FR-6, FR-8)
- `docs/specs/03-data-models.md` (MediumContent)
- `src/types/article.ts` (Article, MediumContent, Blog)
- `src/composables/useArticleState.ts`
- `src/utils/utm.ts`
- `src/components/ui/CopyButton.vue` (created in Task-010)
- `src/pages/x.vue` (for reference on page structure)

## Prerequisites

Task-010 must be completed:
- `src/components/ui/CopyButton.vue` exists
- Navigation-after-extraction is working

## Task

Implement Medium content generation: produce all fields required to manually create a Medium cross-post — title, description, image metadata, a ready-to-paste HTML body, canonical URL, category, and tags — each displayed with individual copy buttons.

## Relevant Specs

- `docs/specs/01-requirements.md` FR-6 — Medium content fields and HTML body structure
- `docs/specs/01-requirements.md` FR-8 — "Follow me" and "Why I don't share full article" snippets
- `docs/specs/01-requirements.md` FR-3 — UTM tag generation
- `docs/specs/01-requirements.md` NFR-2 — Visual copy feedback

## Acceptance Criteria

### Predefined Snippets (Bilingual)

The "Why I don't share full article" snippet text is stored in `src/config/snippets.ts` (create this file if it does not exist). Values from FR-8:

**English:**
- Heading: `Why does this post link to my blog?`
- Body:
  ```
  I have been on Medium for a while, frankly, the editor isn't the best:
  - when I copy paste a post content from my blog on Medium, all the code extracts need manual adjustments.
  - Medium doesn't support WEBP or AVIF…
  - Setting the alternative text on an image bumps the focus back to the top… Not great for a long post!

  Moreover, my analytics shows that very little traffic to my blog comes from Medium.
  ```

**French:**
- Heading: `Pourquoi ce billet renvoie-t-il à mon blog ?`
- Body:
  ```
  J'utilise Medium depuis un moment, franchement, l'éditeur manque d'efficacité :
  - Quand je copie-colle le contenu d'un billet de mon blog sur Medium, tous les extraits de code doivent être ajustés manuellement.
  - Medium ne supporte pas le WEBP ou l'AVIF…
  - La définition d'un texte alternatif sur une image ramène le curseur sur le haut de la page... Pas pratique sur un long article avec plusieurs images !

  De plus, SimpleAnalytics me montre que très peu de trafic vers mon blog provient de Medium.
  ```

Language is determined by `article.blog` (`'english'` → EN snippet, `'french'` → FR snippet).

### Medium Content Generator

- [ ] `src/utils/mediumContentGenerator.ts` created
- [ ] Exported function: `generateMediumContent(article: Article): MediumContent`
- [ ] Builds the following fields:
  - `title`: `article.title`
  - `description`: `article.description`
  - `imageAlt`: `article.imageAlt`
  - `imageCaption`: plain text extracted from `article.imageCreditSnippet` (strip HTML tags); empty string if null
  - `canonicalUrl`: `article.url` (no UTM)
  - `category`: `article.category`
  - `tags`: `article.tags`
  - `bodyHtml`: assembled HTML string (see structure below)

- [ ] `bodyHtml` structure (in order):
  ```html
  <figure>
    <img src="[article.imageUrl]" alt="[article.imageAlt]" />
    <figcaption>[plain text from article.imageCreditSnippet, or omitted if null]</figcaption>
  </figure>
  <hr />
  [article.introduction as-is (already HTML)]
  <p>⬇️⬇️⬇️<br /><a href="[UTM link]">[UTM link]</a></p>
  <hr />
  [article.followMeSnippet as-is (already HTML)]
  <hr />
  <h2>[Why snippet heading (EN or FR)]</h2>
  <p>[Why snippet body (EN or FR), with line breaks as <br />]</p>
  ```
  - UTM link = `generateUTMLink(article.url, 'Medium')`
  - Omit `<figcaption>` entirely if `article.imageCreditSnippet` is null
  - List items in the "Why" snippet body should use `<ul><li>` tags

### Medium Page Component

- [ ] `src/components/platforms/PlatformMedium.vue` created (display component)
- [ ] `src/pages/medium.vue` created (page, delegates to `PlatformMedium.vue`)
- [ ] Reads `extractionState.article` from `useArticleState()`
- [ ] If no article: show message and link back to home
- [ ] Calls `generateMediumContent(article)`
- [ ] Displays a labelled row for each field with a `<CopyButton>`:
  - **Title** — copies `title`
  - **Description** — copies `description`
  - **Image alt text** — copies `imageAlt`
  - **Image caption** — copies `imageCaption` (show "None" label if empty)
  - **Canonical URL** — copies `canonicalUrl`
  - **Category** — copies `category`
  - **Tags** — one `<CopyButton>` per tag
  - **Body HTML** — copies `bodyHtml`; display as a `<pre>` or `<textarea>` so user can visually verify and edit if needed
- [ ] "Start over" / back-to-home button

### Testing

- [ ] `src/utils/mediumContentGenerator.test.ts` created
- [ ] Test: `title`, `description`, `imageAlt`, `canonicalUrl` mapped directly from article
- [ ] Test: `imageCaption` strips HTML from `imageCreditSnippet`; empty string when null
- [ ] Test: `bodyHtml` contains `<img src="...">` with correct src and alt
- [ ] Test: `bodyHtml` contains `<figcaption>` when credit present; omits it when null
- [ ] Test: `bodyHtml` contains introduction HTML verbatim
- [ ] Test: `bodyHtml` UTM link has `utm_source=Medium`
- [ ] Test: `bodyHtml` contains `followMeSnippet` verbatim
- [ ] Test: `bodyHtml` contains EN "Why" heading for English article
- [ ] Test: `bodyHtml` contains FR "Why" heading for French article
- [ ] Test: `tags` array passed through unchanged
- [ ] Run tests: `npm run test` — all pass

- [ ] `src/components/platforms/PlatformMedium.test.ts` created
- [ ] Tests cover: no-article fallback, heading display, content rendering, CopyButton presence, Start over resets state and navigates home

> **Mock pattern:** `useArticleState` returns `{ extractionState, resetState }`. Any test that mocks it **must** include both, or TypeScript will report TS2345. Use `vi.hoisted` for the router push mock and cast `resetState` as `() => void`:
>
> ```typescript
> const mockPush = vi.hoisted(() => vi.fn())
> vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }))
> vi.mocked(useArticleState).mockReturnValue({ extractionState, resetState: vi.fn() as unknown as () => void })
> ```

## Files to Create / Modify

| File | Action |
|------|--------|
| `src/utils/mediumContentGenerator.ts` | Create |
| `src/utils/mediumContentGenerator.test.ts` | Create |
| `src/config/snippets.ts` | Create (if not exists) |
| `src/components/platforms/PlatformMedium.vue` | Create |
| `src/pages/medium.vue` | Create |

## Out of Scope

- Substack page (separate task)
- User-editable snippet configuration
- Actual [Medium API integration is no longer available](https://help.medium.com/hc/en-us/articles/213480228-API-Importing) (checked on February 18, 2026).
- [Import a post to Medium](https://help.medium.com/hc/en-us/articles/214550207-Importing-a-post-to-Medium) as limited support to my blogs.

## After Completion

- [ ] Run tests and verify all pass: `npm run test`
- [ ] Build the app: `npm run build` — fix any TypeScript errors
- [ ] Update `docs/prompts/workspace-context.md` (move task to Completed)
- [ ] Commit on feature branch `feature/task-12-medium-content-generation`
