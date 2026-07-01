# Business Specifications — Issue #112: Intro "false positive"

## Goal & Scope

An article that has an introduction can still land in the `missing-introduction` state,
and the message wrongly tells the user the article "must have paragraphs before the first
`<h2>`." Investigation of the reported article (preserved, cleaned, as the
`tests/fixtures/french-no-h2.html` fixture) shows the real cause: inside `.article-content`
the section headings are `<h3>`,
so there is **no `<h2>`** to mark where the introduction ends. Per the maintainer, an
article without an `<h2>` section heading is authored incorrectly and must be fixed at the
source; the app's `missing-introduction` outcome is therefore correct.

Scope is **user-facing messaging only**. The detection logic, the `<h2>` introduction
boundary, the set of introduction element tags, and the `ExtractionState` status values
(see CLAUDE.md) are unchanged. No blog content is edited from this repository.

## Rules (Example Mapping)

- **R1 — State is unchanged.** When no `<h2>` is found inside `.article-content`, the app
  still enters `missing-introduction` and shows the manual-introduction fallback, which
  recommends adding an `<h2>` section heading to the source article (not that the
  introduction itself is missing).
  Example: the reported article (`tests/fixtures/french-no-h2.html`, section headings are
  `<h3>`) results in `missing-introduction`.

- **R2 — The message names the true cause.** The text shown in that state must explain
  that the source article has no `<h2>` section heading, so the end of the introduction
  cannot be located, and must direct the author to fix the article to use `<h2>` for its
  section headings. It must no longer assert that the article lacks paragraphs.

- **R3 — Surrounding fallback copy stays consistent.** The static guidance around the
  message must agree with R2 and continue to offer manual entry as the immediate
  workaround. UI copy stays in English (current app-UI language), even though the blogs
  are bilingual.

- **R4 — Same message covers the missing-container case.** When `.article-content` itself
  is absent (page is not a recognized article), the same state and a message accurate for
  "the article structure was not recognized" apply — no separate flow is introduced.

## Files to Create or Modify

- `src/composables/useArticleExtractor.ts` — produces the text carried into the
  `missing-introduction` state; reword that text per R2/R4.
- `src/components/article/ManualIntroduction.vue` — renders that text plus surrounding
  guidance; align its static copy with the corrected cause per R3.
- A test fixture under `tests/fixtures/` derived from the reported article (cleaned per the
  CLAUDE.md fixture rules, saved as `french-no-h2.html`) plus the corresponding
  extractor/composable spec — assert that
  an article whose section headings are `<h3>` yields the `missing-introduction` outcome
  and the corrected message.

## Non-functional

No new performance or concurrency requirements; extraction remains a single synchronous
pass over the parsed document. No new architectural pattern is introduced, so no ADR is
required.

status: ready
