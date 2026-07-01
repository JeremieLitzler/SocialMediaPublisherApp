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
- `src/utils/htmlExtractor.ts` — added `'OL'` to `INTRODUCTION_ELEMENT_TAGS` so ordered lists
  in a real article introduction reach the generators (review loop-back fix; see below).
- `CLAUDE.md` — "HTML Extraction Selectors" introduction line now lists `<ol>` alongside the
  other retained tags, matching the extraction.

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

## Review loop-back fixes (round 2)

Addresses `review-results.md` (`status: changes requested`).

1. **Ordered lists now reach the generators (blocking finding resolved).** The builder already
   rendered `<ol>` via `orderedListBlock`, but `INTRODUCTION_ELEMENT_TAGS` in
   `htmlExtractor.ts` excluded `OL`, so a real article's ordered list never entered
   `article.introduction` and TC-03/business-rule 3 failed end-to-end. Added `'OL'` to the set
   (and updated the function's doc comment and CLAUDE.md's selector list to match). The business
   spec's premise — "the existing extraction already retains them" — was inaccurate for `<ol>`;
   this one-line extraction change is the minimal fix that makes the feature whole, so touching
   `htmlExtractor.ts` (outside the originally declared file list) is justified over descoping an
   explicitly required block type.
2. **`extractParagraphTexts` retained, not removed (minor finding).** It is now unused by the
   generators but still exported and covered by its own spec. Deletion would require editing a
   `.spec.ts`, which is out of `/jli-code`'s remit (`/jli-test-write` owns test files). It is a
   stable, tested pure helper kept available for future consumers; retention is documented here
   rather than silently left dangling.

## Self-review (three candidates examined)

- **`div.highlight` code text may include line-number gutters.** `codeBlock` reads
  `element.textContent`; a Chroma/Hugo highlight wrapper with a line-number column would
  concatenate numbers into the fence. Pre-existing, no fixture/test exercises it, and fixing it
  needs real highlight markup to validate — left unchanged to avoid an unverifiable edit.
- **A single sentence longer than 280 chars inside a splittable paragraph** is emitted as a
  chunk without the `oversized` flag. Spec/TC-14 scope oversized handling to non-paragraph
  blocks and unsplittable paragraphs, both already flagged; changing this would exceed spec.
- **Ordered-list `start` attribute ignored** — numbering always begins at `1.`. Business rule 3
  requires sequential `1., 2., …`, so starting at 1 is spec-correct; no change.

Only candidate that was an actual defect against the spec (the `<ol>` extraction gap) was fixed.

status: ready
