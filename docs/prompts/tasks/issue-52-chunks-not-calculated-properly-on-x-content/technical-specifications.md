# Technical Specifications — Issue 52: Chunks Not Calculated Properly on X Content

## Files Changed

### `src/types/article.ts`
Added new `XChunk` interface with `text: string` and `oversized?: boolean` fields. Changed `XContent.chunks` from `string[]` to `XChunk[]`.

### `src/utils/xContentGenerator.ts`
Replaced the single-string `htmlToText` flow with a paragraph-first chunking pipeline. Added `extractParagraphTexts`, `hasSentenceBoundary`, and `buildRawChunksFromParagraph` functions. Updated `formatChunks` to accept and return `XChunk`-shaped objects. Updated `generateXContent` to drive the new pipeline.

### `src/components/platforms/PlatformX.vue`
Updated chunk rendering to use `chunk.text` for display and copy. Added `border-orange-500` conditional class when `chunk.oversized` is true. Added static warning message paragraph rendered only when `chunk.oversized` is true. Updated `chunkCountLabel` computed to include oversized count when greater than zero. Added `oversizedCount` computed property.

### `src/utils/xContentGenerator.test.ts`
Updated all chunk access from direct string methods to `.text` property to match the `XChunk` type; added four new tests covering paragraph-first chunking, sentence-boundary splitting, oversized flag assignment, and warning message exclusion from chunk text.

---

## Non-Trivial Decisions

### Why `extractParagraphTexts` uses `querySelectorAll('p')` rather than iterating `childNodes`

The article introduction HTML stored in `Article.introduction` is a fragment of paragraph elements. Using `querySelectorAll('p')` on the parsed document body selects all `<p>` nodes regardless of nesting depth, which matches how the existing `htmlExtractor.ts` collects introduction paragraphs (all `<p>` tags before the first `<h2>` in `.article-content`). A `childNodes` walk would miss `<p>` elements wrapped in a container div that some blog templates produce.

### Why the `oversized` flag is omitted (not set to `false`) when not needed

The `XChunk` interface declares `oversized?: boolean` (optional). Chunks that are not oversized omit the field entirely rather than explicitly setting `false`. This keeps the objects lean and makes truthiness checks (`if (chunk.oversized)`) naturally falsy for absent fields, consistent with Vue template `v-if` behaviour.

### Why `buildRawChunksFromParagraph` is a separate function from `buildChunksFromSentences`

The paragraph-level decision (fits ≤280, has no boundary → oversized, has boundary → sentence-split) is distinct from the sentence-accumulation logic. Separating them keeps each function at ≤5 lines of meaningful logic, satisfies the Object Calisthenics single-responsibility rule, and makes the oversized path independently testable without involving sentence splitting.

### Why `formatChunks` now takes a generic intermediate type instead of `string[]`

Raw chunk objects carry the `oversized` flag before formatting. If formatting received plain strings, the flag information would be lost and would need to be re-derived after the fact. Passing the intermediate `{ text, oversized? }` shape through `formatChunks` means the flag is propagated to the final `XChunk[]` in one pass with no re-computation.

### Why the warning message in `PlatformX.vue` is a `<p>` not a `<span>` or `<div>`

The message is a standalone informational sentence that follows the chunk content. A `<p>` element is semantically appropriate for a sentence of prose and is consistent with the `<pre>` element above it in the card. Using `<div>` would carry no semantic meaning; using `<span>` would imply inline context within another flow.

---

## Self-Code-Review: Potential Bugs and Performance Issues

### 1. `querySelectorAll('p')` selects nested paragraphs if the HTML ever contains `<div><p>…</p></div>`

**Risk:** If the introduction HTML contains `<p>` elements nested inside block containers (e.g., a `<blockquote><p>…</p></blockquote>`), those paragraphs are returned alongside top-level ones. This could produce duplicate content if the outer container is also iterated.

**How addressed:** The current `htmlExtractor.ts` collects introduction HTML as a sequence of sibling `<p>` elements selected directly from `.article-content` before the first `<h2>`. The resulting HTML fragment is a flat list of `<p>` elements with no block wrappers. The risk is therefore theoretical given the current data shape, but is worth noting if the extraction logic ever changes.

### 2. Whitespace normalisation inside `extractParagraphTexts` collapses intentional line breaks

**Risk:** `(node.textContent ?? '').replace(/\s+/g, ' ').trim()` collapses all whitespace sequences (including newlines) to a single space. A paragraph that deliberately uses `<br>` elements for line structure would lose that structure.

**How addressed:** The X platform post format is plain text. `<br>` line breaks inside a tweet paragraph are not a supported design pattern in the current spec. The normalisation matches the behaviour of the previous `htmlToText` utility and is correct for the current use case. If multi-line paragraphs are required in future, `extractParagraphTexts` is the single function to update.

### 3. `buildChunksFromSentences` may produce a chunk whose raw text exceeds 280 characters when a single sentence is longer than 280 characters

**Risk:** When `splitIntoSentences` returns a sentence longer than `MAX_CHUNK_LENGTH`, `buildChunksFromSentences` assigns it to `current` and eventually pushes it as a chunk. The resulting chunk text is longer than 280 characters but carries no `oversized` flag, because `buildRawChunksFromParagraph` only applies the flag when the entire paragraph has no sentence boundary.

**How addressed:** This is intentional and consistent with Rule 2 of the business specifications: a paragraph that *does* have sentence boundaries is split at those boundaries. If one of the resulting sub-sentences is individually >280 characters, that is a content authoring concern beyond the scope of this fix. The oversized flag is reserved specifically for Rule 3 (no sentence boundary at all). Adding an additional oversized check per sub-sentence would be a separate business rule not covered by issue 52.

---

status: ready
