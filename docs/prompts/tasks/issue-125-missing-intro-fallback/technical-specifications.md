# Technical Specifications — Issue #125: Missing-introduction fallback

## Files created or changed

- `src/utils/manualIntroduction.ts` (new) — pure helpers: `MAX_MANUAL_INTRODUCTION_LENGTH`, `hasVisibleCharacter`, `boundManualIntroduction`, and `toIntroductionHtml` (bound + HTML-escape + wrap in `<p>`).
- `src/composables/useArticleExtractor.ts` — on EMPTY, retain the article with a blank introduction and mark `missing-introduction` (R1); NO_HEADING stays a source-fix instruction with no article (R4); introduced `makeState`, `buildArticle`, `resolveExtractionState` helpers.
- `src/components/article/ArticleInput.vue` — remember the selected platform on both `success` and `missing-introduction`; navigate to a platform only on `success` (R2, R6).
- `src/components/article/ManualIntroduction.vue` — cause-specific fallback: manual entry only when the article was retained (EMPTY); on a valid intro, complete the retained article, mark success and open the remembered platform (R3, R4, R5); bounded native `<textarea>`.
- `src/pages/index.vue` — unchanged (already renders the fallback on `/` and resets on mount, R2/R7).

## Non-trivial decisions (WHY)

- **EMPTY vs NO_HEADING discriminator = article presence.** The fallback distinguishes the two causes by `extractionState.article !== null` rather than a new flag. EMPTY retains the article (R1) so its non-null presence already means "manual entry is possible"; adding a separate discriminator would duplicate that signal and risk drift.
- **Manual introduction is HTML-escaped and wrapped in `<p>`.** The reader types plain text. Escaping makes any angle-bracket markup render as literal characters on both text platforms (X/LinkedIn interpolation) and preview platforms (Medium/Substack, post-DOMPurify), satisfying TC-10/TC-11 and security rules 1–2. Wrapping in `<p>` is required because `extractIntroductionBlocks` only iterates *element* children — a bare text node would yield no introduction block on X/LinkedIn.
- **Length bound applied twice (maxlength + slice).** `maxlength` stops typed/pasted input reaching shared state; `boundManualIntroduction` re-clamps in `toIntroductionHtml` as defense-in-depth before content generation, so a programmatic write cannot bypass the cap (security rule 3, TC-12).
- **`makeState` factory in the extractor.** Every transition (loading/success/missing/error) must produce the full five-field `ExtractionState`; a single override-based factory keeps the shape consistent and removes the repeated literals that previously diverged between branches.
- **`introduction` passed into `buildArticle`.** `extractIntroduction(doc)` is called once and its result threaded through, so the EMPTY branch can retain the article with `''` and the success branch reuses the same value — no second parse.
- **Completion mutates the retained article in place, then navigates (no re-fetch).** The introduction is set on the already-retained reactive article and status flipped to `success` before `router.push`, so the platform view is produced from in-memory data with no second extraction or network call (R5, TC-7).
- **Replaced `<Textarea>` with a native `<textarea>`.** `ManualIntroduction.vue` referenced a `Textarea` component that does not exist in `src/components/ui/` and is not auto-registered — a latent broken reference. A native, Tailwind-styled `<textarea>` renders reliably, supports `maxlength`, and needs no new dependency.

## Self-code review (three fixes)

1. **Broken input control** — the pre-existing `<Textarea>` reference resolved to nothing; replaced with a native `<textarea>` so the fallback input actually renders.
2. **Unbounded intro (client-side DoS)** — added `maxlength` plus a slicing bound in `toIntroductionHtml`, capping what reaches shared state and generators.
3. **Redundant introduction extraction** — refactored so `extractIntroduction` runs once and its value is reused for both the EMPTY (retain) and success paths, instead of re-deriving it while building the article.

## Object Calisthenics exceptions

- The `setup()` bodies of `ArticleInput.vue` and `ManualIntroduction.vue` declare more than two top-level bindings and use Vue lifecycle/composable conventions; this is the framework idiom noted as an allowed exception. Logic is factored into ≤5-line helpers (`rememberSelectedPlatform`, `completeRetainedArticle`, `openSelectedPlatform`, `handleContinue`).

status: ready
