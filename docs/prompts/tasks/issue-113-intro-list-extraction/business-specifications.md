# Business Specifications — Issue #113: Introduction list not extracted

## Goal and scope

When an article introduction (everything before the first `<h2>` in `.article-content`)
contains non-paragraph blocks — unordered lists, ordered lists, blockquotes, or code
blocks — the generated **LinkedIn** and **X** content currently drops them, keeping only
paragraphs. This fix makes the plain-text platforms reproduce every introduction block, in
source order, as readable plain text. Medium and Substack already embed the raw
introduction HTML and render lists correctly; they are out of scope and must stay unchanged.

The introduction block types are defined by CLAUDE.md ("HTML Extraction Selectors") and the
existing extraction already retains them; only the plain-text rendering for LinkedIn and X
is defective.

## Files to create or modify

- `src/utils/articleHtmlBuilder.ts` — owns the shared helper that turns introduction HTML
  into the ordered plain-text blocks LinkedIn and X consume. Must emit a block for every
  supported introduction element, not just paragraphs, preserving source order.
- `src/utils/linkedInContentGenerator.ts` — assembles the LinkedIn body from those blocks.
- `src/utils/xContentGenerator.ts` — assembles X tweet chunks from those blocks.
- Test specs co-located with the three files above, covering the new block types and their
  ordering (per CLAUDE.md testing conventions; utils target 100% coverage).

## Rules

1. **Source order is preserved across all block types.** A list sitting between two
   paragraphs appears between them in the output, never relocated or grouped. (See issue
   Expected output: the bullet list stays between "Supposons que vous disposiez :" and
   "Ensuite, vous disposez…".)

2. **Unordered list** — each item renders on its own line prefixed with `- `.

3. **Ordered list** — each item renders on its own line numbered sequentially (`1. `, `2. `,
   …) in list order.

4. **Blockquote** — renders as text with each line prefixed with `> `.

5. **Code block** (`<pre>` or `div.highlight`) — renders fenced between ` ``` ` lines with
   its internal line breaks and indentation preserved; its whitespace is not collapsed (a
   paragraph's whitespace still is).

6. **Empty blocks are omitted.** A list with no non-empty items, or an empty paragraph,
   produces no output, exactly as empty paragraphs are skipped today.

7. **LinkedIn body** — consecutive blocks are separated by a blank line, keeping the existing
   visual-separator and UTM-link tail unchanged.

8. **X chunking** — each non-paragraph block (list, blockquote, code block) is its own
   chunk unit: it is never merged into an adjacent paragraph's tweet, and the per-tweet
   length limit and oversized-chunk behaviour apply to it the same way they apply to a
   paragraph today.

9. **No introduction / no supported blocks** — output is unchanged from current behaviour
   (LinkedIn shows only the separator and link; X yields no content chunks).

status: ready
