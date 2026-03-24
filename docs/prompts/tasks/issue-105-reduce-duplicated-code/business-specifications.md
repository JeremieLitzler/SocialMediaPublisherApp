# Business Specifications — Issue #105: Reduce Duplicated Code

## Goal and Scope

Refactor the platform content generator utilities to eliminate identified code duplication flagged by SonarQube. The goal is to reduce maintenance burden and the risk of divergent behaviour by centralising shared logic into single-source-of-truth modules.

No user-visible behaviour changes are permitted. All generated content must remain identical before and after the refactor.

## Rules

### Rule 1 — Extract shared HTML-building helpers into a dedicated utility

`buildFigcaption()` and `buildFigureHtml()` are currently implemented identically in both `src/utils/mediumContentGenerator.ts` and `src/utils/substackContentGenerator.ts`. They must be extracted to a single shared utility module (`src/utils/articleHtmlBuilder.ts`). Both generator files import from this new module.

### Rule 2 — Centralise the VISUAL_SEPARATOR constant

The string `'⬇️⬇️⬇️'` is duplicated in `mediumContentGenerator.ts`, `substackContentGenerator.ts`, and `linkedInContentGenerator.ts`. It must be defined once in a shared constants file (`src/config/constants.ts` or co-located in `articleHtmlBuilder.ts`) and imported where needed.

### Rule 3 — Unify paragraph-extraction logic

`extractParagraphTexts` (in `xContentGenerator.ts`) and `extractParagraphs` (in `linkedInContentGenerator.ts`) implement the same operation: parse an HTML string with DOMParser, collect `<p>` element text content, collapse whitespace, and exclude empty strings. They must be merged into a single exported function in `src/utils/htmlToText.ts` (already exists) or a new shared utility, and both generator files must import from that location.

The unified function must preserve the behaviour of both callers: return an array of trimmed, whitespace-collapsed, non-empty paragraph strings.

## Files to Create or Modify

- `src/utils/articleHtmlBuilder.ts` — new file; exports the shared figure HTML builder and the VISUAL_SEPARATOR constant
- `src/utils/htmlToText.ts` — extend with the shared paragraph-extraction function (or create a separate utility if cohesion is a concern)
- `src/utils/mediumContentGenerator.ts` — remove duplicated helpers; import from shared modules
- `src/utils/substackContentGenerator.ts` — remove duplicated helpers; import from shared modules
- `src/utils/linkedInContentGenerator.ts` — remove local VISUAL_SEPARATOR; import from shared module
- `src/utils/xContentGenerator.ts` — remove local paragraph extraction; import from shared module

## Constraints

- No change to any public function signatures (the generators' exported functions stay identical).
- No change to generated output for any article input.
- All existing tests must continue to pass.
- New unit tests must cover the extracted shared utilities.

status: ready
