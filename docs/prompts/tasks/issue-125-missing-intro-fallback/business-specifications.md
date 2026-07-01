# Business Specifications — Issue #125: Missing-introduction fallback

## Goal

When an article is fetched but its introduction cannot be read, the reader must still see the fallback and keep the data that WAS read, then continue to the platform they chose once an introduction exists. Today the extractor discards the whole article on a missing introduction, and on platform routes the fallback is invisible.

## Scope

Covers the two missing-introduction causes distinguished in #112:

- EMPTY: `.article-content` has a first `<h2>` but no introduction before it (e.g. `tests/fixtures/english-no-intro.html`).
- NO_HEADING: `.article-content` has no `<h2>` (e.g. `tests/fixtures/french-no-h2.html`).

Out of scope: extraction selectors, platform content generation, and the domain whitelist.

## Rules

R1 — Preserve the article on EMPTY. When only the introduction is empty, the system still reads and retains the article's other data (URL, title, description, image, categories, tags) instead of discarding it. Example: the CSS Variables fixture keeps its title, subtitle, two categories and two tags; only the introduction is blank.

R2 — Stay on home while the introduction is missing. A missing-introduction result keeps the reader on `/` and shows the fallback there; it does NOT navigate to a platform route. The reader therefore never lands on a platform route without an introduction — this is what resolves the reported invisibility.

R3 — EMPTY fallback offers manual entry. The EMPTY fallback conveys that the introduction could not be read but the article was read, invites the reader to provide one below or to add one to the source before the first `<h2>`, and shows an input for the introduction.

R4 — NO_HEADING fallback instructs a source fix. With no `<h2>` the introduction boundary cannot be located; the fallback instructs the reader to update the source to include at least one `<h2>` preceded by an introduction and does NOT offer manual entry. Resolution is re-extraction after the source is fixed.

R5 — Completing the introduction opens the chosen platform. Once the reader supplies a non-empty introduction (at least one character), the retained article is completed with it, the result becomes a success, and the app opens the platform selected before extracting. Example: reader picked LinkedIn, hit a missing intro, typed one; the LinkedIn view opens with that introduction.

R6 — Selected platform is remembered across the missing-introduction state so R5 can open the correct platform.

R7 — Home reset on entry is preserved. Returning to `/` (including via Back) starts a fresh extraction and clears any prior missing-introduction state; a platform route reached without an article still redirects home, so a stale platform view with no data never shows.

## Files to modify (roles only)

- `src/composables/useArticleExtractor.ts` — On EMPTY, retain the read fields and mark the result missing-introduction rather than discarding everything; keep NO_HEADING as a source-fix instruction (R1, R3, R4).
- `src/components/article/ArticleInput.vue` — Carry the selected platform into the missing-introduction state; navigate to a platform only on success, not on a missing introduction (R2, R6).
- `src/components/article/ManualIntroduction.vue` — Show the cause-specific message (R3/R4); on a valid manual introduction, complete the retained article, mark success and open the remembered platform (R5).
- `src/pages/index.vue` — Continues to render the fallback on `/` for a missing introduction and to reset on mount; no fallback branch is added to platform pages (R2, R7).
- Platform pages (`linkedin.vue`, `x.vue`, `medium.vue`, `substack.vue`) and their components — unchanged; reached only once an article exists, with their existing no-article redirect kept as the safety net.

## Observable qualities

- Fallback copy uses fixed literals: no fetched HTML, URL, or article text is interpolated into it (per #112 security guidance).
- The transition from missing-introduction to the platform view happens on the first character-bearing submission and makes no second extraction or network call.

status: ready
