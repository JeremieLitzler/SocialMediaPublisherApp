# Business Specifications — Issue #112: Intro "false positive"

## Goal & Scope

The `missing-introduction` state must be reached for the right reasons and must explain the right cause. Two defects are in scope:

1. **False positive (messaging).** An article that _has_ an introduction but whose section headings are `<h3>` (no `<h2>` inside `.article-content`) still correctly reaches `missing-introduction`, but the message wrongly says the article "must have paragraphs before the first `<h2>`." Per the maintainer, an article without an `<h2>` section heading is authored incorrectly and must be fixed at source; the outcome is correct, the wording is not. Investigation of the reported article (preserved, cleaned, as `tests/fixtures/french-no-h2.html`) confirmed this cause.

2. **False negative (detection).** An article that has a first `<h2>` but **no qualifying introduction content before it** currently succeeds with an empty introduction, producing platform posts with no intro. It must instead reach `missing-introduction`.

The `<h2>` introduction boundary, the set of introduction element tags, and the
`ExtractionState` status values (see CLAUDE.md) are unchanged. Detection changes only in that an empty extracted introduction now yields `missing-introduction` instead of success. No blog content is edited from this repository. UI copy stays in English (current app-UI language).

## Rules (Example Mapping)

- **R1 — Missing `<h2>` still triggers the fallback.** When `.article-content` contains introduction content but no `<h2>`, the app enters `missing-introduction` and shows the manual-introduction fallback, which recommends adding an `<h2>` section heading to the source article. Example: `tests/fixtures/french-no-h2.html` (headings are `<h3>`).

- **R2 — The missing-`<h2>` message names that cause.** In the R1 case the text explains the source article has no `<h2>` section heading, so the end of the introduction cannot be located, and directs the author to use `<h2>` for section headings. It must not assert the article lacks paragraphs or an introduction.

- **R3 — Empty introduction also triggers the fallback (new).** When `.article-content` has a first `<h2>` but no qualifying introduction content before it, the app enters `missing-introduction` (previously it succeeded with an empty introduction). No platform content is produced.

- **R4 — The empty-introduction message names _its_ cause.** In the R3 case the text explains the article has no introduction content before its first section heading and invites the user to add one to the source article or enter one manually below. This message is distinct from the R2 message and, being factually true here, may state that introduction content is missing.

- **R5 — Missing container reuses the R2 message.** When `.article-content` is absent (page not a recognized article), the same state and an R2-style "structure not recognized" message apply — no separate flow.

- **R6 — Fallback copy stays consistent and offers manual entry.** For every cause, the static guidance agrees with the message shown and continues to offer manual entry as the immediate workaround, which lets the user proceed to success with a user-entered introduction.

## Files to Create or Modify

- `src/composables/useArticleExtractor.ts` — decides the `missing-introduction` outcome and the text carried into it; distinguish the missing-`<h2>` cause (R2/R5) from the empty-introduction cause (R4).
- `src/utils/htmlExtractor.ts` — introduction extraction must report the empty-introduction case (R3) as a missing introduction rather than as success.
- `src/components/article/ManualIntroduction.vue` — renders the cause-specific message plus surrounding guidance; keep it consistent per R6.
- Test fixtures under `tests/fixtures/` (cleaned per the CLAUDE.md fixture rules) covering the `<h3>`-only case and the first-`<h2>`-without-introduction case, plus the corresponding specs.

## Non-functional

Extraction remains a single synchronous pass over the parsed document; no new performance or concurrency requirements. No new architectural pattern is introduced, so no ADR is required.

status: ready
