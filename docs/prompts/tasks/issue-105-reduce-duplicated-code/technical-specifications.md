# Technical Specifications — Issue #105: Reduce Duplicated Code

## Summary of Changes

### `src/utils/articleHtmlBuilder.ts` (new file)

Centralises three previously duplicated pieces of code:

1. `VISUAL_SEPARATOR` constant (`'⬇️⬇️⬇️'`) — was duplicated in `mediumContentGenerator.ts`, `substackContentGenerator.ts`, and `linkedInContentGenerator.ts`.
2. `buildFigcaption(imageCreditSnippet)` — was identical in `mediumContentGenerator.ts` and `substackContentGenerator.ts`.
3. `buildFigureHtml(article)` — was identical in `mediumContentGenerator.ts` and `substackContentGenerator.ts`.
4. `extractParagraphTexts(html)` — functionally identical to the private `extractParagraphs` in `linkedInContentGenerator.ts` and `extractParagraphTexts` in `xContentGenerator.ts`. Unified under a single exported function using `DOMParser` for safe HTML parsing.

**Why a new file instead of extending `htmlToText.ts`:** `htmlToText.ts` converts HTML to a single collapsed string. `articleHtmlBuilder.ts` builds HTML fragments and extracts structured data (paragraph arrays). Cohesion would be violated by merging them.

### `src/utils/mediumContentGenerator.ts` (modified)

- Removed: `buildFigcaption()`, `buildFigureHtml()`, `VISUAL_SEPARATOR` constant.
- Added import: `{ VISUAL_SEPARATOR, buildFigureHtml }` from `./articleHtmlBuilder`.
- `buildImageCaption()` remains local — it converts a credit snippet to plain text for the `imageCaption` field, a Medium-only concern.
- No change to `generateMediumContent()` signature or output.

### `src/utils/substackContentGenerator.ts` (modified)

- Removed: `buildFigcaption()`, `buildFigureHtml()`, `VISUAL_SEPARATOR` constant, `htmlToText` import.
- Added import: `{ VISUAL_SEPARATOR, buildFigureHtml }` from `./articleHtmlBuilder`.
- No change to `generateSubstackContent()` signature or output.

### `src/utils/linkedInContentGenerator.ts` (modified)

- Removed: local `VISUAL_SEPARATOR` constant, private `extractParagraphs()` function.
- Added import: `{ VISUAL_SEPARATOR, extractParagraphTexts }` from `./articleHtmlBuilder`.
- Renamed usage: `extractParagraphs(...)` → `extractParagraphTexts(...)` (same behaviour).
- No change to `generateLinkedInContent()` signature or output.

### `src/utils/xContentGenerator.ts` (modified)

- Removed: private `extractParagraphTexts()` function.
- Added import: `{ extractParagraphTexts }` from `./articleHtmlBuilder`.
- No change to `generateXContent()` signature or output.

## Technical Choices

**Single shared utility file over multiple small files:** All three extracted items (VISUAL_SEPARATOR, figure HTML builder, paragraph extractor) are used exclusively by the content generator utils. Grouping them in `articleHtmlBuilder.ts` keeps the number of files manageable and makes their purpose discoverable.

**Preserving `buildImageCaption` in `mediumContentGenerator.ts`:** This function converts a credit snippet to plain text for Medium's `imageCaption` field. It is not used by any other generator. Keeping it local avoids leaking a Medium-specific concern into the shared module.

**DOMParser for paragraph extraction:** The unified `extractParagraphTexts` continues to use `DOMParser` (not `innerHTML` assignment) to safely parse the introduction HTML. This is consistent with ADR-007.

## Self-Code Review

**Potential issue 1 — `extractParagraphTexts` in xContentGenerator was private:** The old xContentGenerator.ts had its own private `extractParagraphTexts`. The new shared function is exported. This changes the module boundary but not the behaviour; there is no risk of callers misusing it since the function is pure with no side effects.

**Potential issue 2 — `linkedInContentGenerator` renamed `extractParagraphs` → `extractParagraphTexts`:** The two original functions were functionally identical (both collapse whitespace, both exclude empty strings). The merge is safe.

**Potential issue 3 — `substackContentGenerator` removes its `htmlToText` import:** After removing `buildFigcaption`, the import of `htmlToText` in `substackContentGenerator.ts` becomes unused. It has been removed to avoid a lint warning.

status: ready
