# Technical Specifications — Issue #113: Introduction list extraction

## Files created or changed

- `src/types/article.ts` — added `IntroductionBlock` interface (`text`, `isParagraph`):
  the shared shape LinkedIn and X consume.
- `src/utils/articleHtmlBuilder.ts` — added `extractIntroductionBlocks(html)` plus private
  helpers that render each introduction element type to plain text; kept the existing
  `extractParagraphTexts` untouched.
- `src/utils/linkedInContentGenerator.ts` — assembles the body from `extractIntroductionBlocks`
  instead of paragraphs only; separator and UTM tail unchanged.
- `src/utils/xContentGenerator.ts` — chunks per block; paragraphs split at sentence
  boundaries, non-paragraph blocks are atomic chunk units.

## Design decisions (why)

- **One block model (`IntroductionBlock`) carrying `isParagraph`.** X needs to know which
  blocks may be split at sentence boundaries (paragraphs) and which must stay atomic (lists,
  blockquotes, code). A single boolean keeps the type to two fields and lets both generators
  share one extraction pass; LinkedIn simply ignores the flag.
- **Iterate `doc.body.children`, not `querySelectorAll('p')`.** Source order across mixed
  block types (TC-06/07) requires walking top-level elements in document order. The old
  paragraph-only path also wrongly picked up `<p>` nested inside a blockquote; block iteration
  renders the blockquote once, fixing that.
- **`script`/`style` stripped at parse time; text read via `textContent`.** Satisfies security
  guidelines 1–2 (build from DOM text, never raw markup) and TC-16 — tags never propagate and
  active element text does not leak.
- **Blockquote lines via a `<br>`/block-boundary text flattener (`elementLines`).**
  `textContent` alone concatenates separate `<p>` lines with no separator. Inserting `\n` at
  `<br>` and block boundaries makes "two lines of text" (TC-04) work whether the source uses
  separate paragraphs, a `<br>`, or a soft newline.
- **List items read from direct `<li>` children (`list.children` filtered), not
  `:scope > li`.** Avoids relying on selector-engine `:scope` support and keeps nested lists
  from double-counting.
- **Non-paragraph blocks are atomic chunks on X (`buildRawChunksFromAtomicBlock`).** Spec
  rule 8 / TC-13/14: a list or code block is its own tweet, never merged, and an oversized one
  is flagged exactly like an unsplittable oversized paragraph rather than sentence-split (which
  would break list structure).
- **Code-block whitespace preserved; only outer blank lines trimmed.** Rule 5 / TC-05 require
  internal line breaks and indentation kept verbatim, so `collapseWhitespace` is not applied to
  code. `stripOuterBlankLines` uses two single-quantifier regexes (`/^[\r\n]+/`, `/\s+$/`),
  which run in linear time — no catastrophic backtracking (security guideline 3 / TC-17).

## Self-review fixes applied

1. **List-item selection** switched from `:scope > li` to filtering `list.children`, removing a
   dependency on selector-engine `:scope` support.
2. **Code block emit condition** changed to "any non-empty `textContent`" (then outer blank
   lines stripped) instead of "non-empty after stripping". A whitespace/line-break-only code
   block (TC-17's pathological input) now still produces a fence, matching TC-17's expectation
   while leaving truly empty `<pre></pre>` omitted. Rule 6's omit examples name only lists and
   paragraphs, and code-block whitespace is significant, so this reading is consistent.
3. **Defensive `doc.body` guard** in `extractIntroductionBlocks` returns `[]` on a null body
   instead of throwing on `.children`.

## Noted discrepancy (non-blocking)

Business-spec rule 3 and TC-03 require **ordered lists** (`<ol>`) to render as numbered items,
and the builder handles `<ol>`. However, the introduction *extraction* in
`src/utils/htmlExtractor.ts` (`INTRODUCTION_ELEMENT_TAGS`) and CLAUDE.md's selector list retain
only `<p>`, `<pre>`, `<ul>`, `<blockquote>` — not `<ol>`. `htmlExtractor.ts` is outside this
task's declared file scope, and the test cases drive the generators with introduction HTML
directly, so every scenario (including TC-03) is satisfiable as written. But end-to-end, a real
article's `<ol>` would not reach the generators until `'OL'` is added to
`INTRODUCTION_ELEMENT_TAGS`. Flagging for a follow-up decision; not changed here to respect the
declared scope.

status: ready
