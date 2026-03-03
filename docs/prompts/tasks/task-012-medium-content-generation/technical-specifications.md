# Technical Specifications — Task-012: Medium Content Generation

## Files Created

| File | Description |
|------|-------------|
| `src/config/snippets.ts` | Defines `WhySnippet` interface and bilingual EN/FR snippet constants with `getWhySnippet(blog)` selector |
| `src/utils/mediumContentGenerator.ts` | Pure function `generateMediumContent(article)` that assembles `MediumContent` including the full `bodyHtml` |
| `src/components/platforms/PlatformMedium.vue` | Display component: reads state, calls generator, renders all fields with `CopyButton` per field |
| `src/pages/medium.vue` | Thin page wrapper that delegates to `PlatformMedium.vue` |

## Technical Choices

### Pre-built HTML in snippets.ts
The bilingual "Why" snippet bodies are stored as pre-built HTML strings rather than raw text with a conversion function. Rationale: the HTML structure (paragraphs and `<ul><li>` lists) is stable and specified; generating it at call-time from raw text would add complexity with no benefit.

### `htmlToText` for imageCaption
`imageCreditSnippet` is stored as raw HTML in the article; `imageCaption` (plain text) strips tags via the existing `htmlToText()` utility. This avoids duplicating DOMParser logic.

### Helper functions per HTML block
`buildFigureHtml`, `buildUtmBlock`, `buildWhyBlock`, and `buildBodyHtml` are extracted as separate functions (Object Calisthenics: one level of indentation per method). Each block in `bodyHtml` maps to exactly one function.

### `textarea readonly` for bodyHtml display
The spec allows `<pre>` or `<textarea readonly>`. A `<textarea>` was chosen because it provides native scrolling and allows the user to select partial text without layout interference.

status: ready
