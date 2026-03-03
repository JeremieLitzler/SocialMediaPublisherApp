# Task-011: LinkedIn Content Generation — Technical Specifications

## Files Created

| File | Description |
|------|-------------|
| `src/utils/linkedInContentGenerator.ts` | Pure function `generateLinkedInContent(article)` that extracts paragraphs from intro HTML and composes the LinkedIn body string |
| `src/components/platforms/PlatformLinkedIn.vue` | Display component that reads article state, calls the generator, and renders a single copyable body block |
| `src/pages/linkedin.vue` | Thin page wrapper that delegates entirely to `PlatformLinkedIn` |

## Non-Trivial Technical Choices

### Paragraph-aware HTML extraction instead of `htmlToText`

`htmlToText` collapses all whitespace into a single line (`rawText.replace(/\s+/g, ' ')`), which destroys paragraph breaks. LinkedIn's composer respects newlines, so paragraph breaks must survive as `\n\n`.

The generator uses `document.querySelectorAll('p')` on a `DOMParser`-parsed document, maps each `<p>` to its trimmed `textContent`, filters empty results, and joins with `\n\n`. This keeps the per-paragraph granularity that LinkedIn needs while still stripping all HTML tags.

### Internal helper `extractParagraphs` kept private

`extractParagraphs` is not exported. It is an implementation detail of `generateLinkedInContent`. Keeping it unexported prevents callers from depending on the intermediate representation and makes the public API surface minimal.

### Empty-paragraph filtering

After trimming, paragraphs with zero length are filtered out. This guards against HTML that contains empty `<p></p>` elements (common in CMSs), which would otherwise introduce spurious blank lines in the output.

### Body format constant values

`PARAGRAPH_SEPARATOR` (`\n\n`) and `VISUAL_SEPARATOR` (`⬇️⬇️⬇️`) are module-level constants. This makes the format easy to locate and change in one place without hunting through string literals.

### Component mirrors PlatformX structure exactly

`PlatformLinkedIn.vue` follows the same guard-then-content pattern as `PlatformX.vue`: a `v-if="!article"` block with a fallback message and a `v-if="article"` block with the actual content. The `body` computed property returns an empty string when `article` is null, which is safe because the surrounding `v-if` prevents that block from rendering.

status: ready
