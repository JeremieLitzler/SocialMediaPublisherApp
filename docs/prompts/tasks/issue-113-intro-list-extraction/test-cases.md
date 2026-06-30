# Test Cases — Issue #113: Introduction list extraction

Scenarios describe observable behaviour only: given an article introduction (the blocks
before the first `<h2>` in `.article-content`), what plain text appears in the generated
**LinkedIn** body and **X** tweet chunks. Medium and Substack are out of scope and are not
exercised here.

## Block rendering — single block type

### TC-01 Paragraphs render as plain text
- **Precondition:** Introduction contains two paragraphs of plain text.
- **Action:** Generate LinkedIn and X content.
- **Expected:** Both paragraphs appear as readable plain text, in source order, with their
  internal whitespace collapsed.

### TC-02 Unordered list items are bulleted
- **Precondition:** Introduction contains a single unordered list with three items.
- **Action:** Generate content.
- **Expected:** Each item appears on its own line prefixed with `- `, in list order.

### TC-03 Ordered list items are numbered
- **Precondition:** Introduction contains a single ordered list with three items.
- **Action:** Generate content.
- **Expected:** Each item appears on its own line numbered sequentially `1. `, `2. `, `3. `,
  in list order.

### TC-04 Blockquote lines are quote-prefixed
- **Precondition:** Introduction contains a blockquote with two lines of text.
- **Action:** Generate content.
- **Expected:** Each line of the quote appears prefixed with `> `.

### TC-05 Code block is fenced with whitespace preserved
- **Precondition:** Introduction contains a code block (`<pre>` or `div.highlight`) whose
  content has internal line breaks and indentation.
- **Action:** Generate content.
- **Expected:** The code appears between opening and closing ` ``` ` fence lines, with its
  line breaks and indentation preserved exactly (whitespace not collapsed).

## Source order across mixed block types

### TC-06 List stays between its surrounding paragraphs
- **Precondition:** Introduction is, in order: a paragraph, an unordered list, a second
  paragraph.
- **Action:** Generate content.
- **Expected:** Output order is paragraph, then the bulleted list, then the second
  paragraph — the list is never relocated or grouped away from its position.

### TC-07 All four non-paragraph types preserve interleaved order
- **Precondition:** Introduction interleaves paragraphs with an ordered list, a blockquote,
  and a code block in a specific source order.
- **Action:** Generate content.
- **Expected:** Every block appears exactly once, each rendered per its type, in the same
  order as the source.

## Empty / omitted blocks

### TC-08 Empty paragraph produces no output
- **Precondition:** Introduction contains an empty (whitespace-only) paragraph between two
  real paragraphs.
- **Action:** Generate content.
- **Expected:** The empty paragraph yields nothing; only the two real paragraphs appear.

### TC-09 List with no non-empty items is omitted
- **Precondition:** Introduction contains a list whose items are all empty/whitespace-only.
- **Action:** Generate content.
- **Expected:** No list output is produced; surrounding real blocks are unaffected.

## LinkedIn-specific assembly

### TC-10 Blocks separated by a blank line
- **Precondition:** Introduction contains multiple non-empty blocks of differing types.
- **Action:** Generate LinkedIn content.
- **Expected:** Consecutive blocks are separated by a blank line.

### TC-11 Visual separator and UTM link tail unchanged
- **Precondition:** A normal introduction with at least one block.
- **Action:** Generate LinkedIn content.
- **Expected:** The existing visual separator and the trailing UTM link still appear as
  before, unaffected by the new block types.

### TC-12 No introduction yields only separator and link
- **Precondition:** Introduction is empty (no blocks).
- **Action:** Generate LinkedIn content.
- **Expected:** Output is unchanged from current behaviour — only the separator and link,
  with no block content.

## X-specific assembly

### TC-13 Each non-paragraph block is its own chunk
- **Precondition:** Introduction is a paragraph immediately followed by an unordered list.
- **Action:** Generate X content.
- **Expected:** The list is a separate tweet chunk; it is never merged into the preceding
  paragraph's tweet.

### TC-14 Oversized block obeys the same length handling as a paragraph
- **Precondition:** Introduction contains a single non-paragraph block (e.g. a long list or
  code block) whose rendered text exceeds the per-tweet length limit.
- **Action:** Generate X content.
- **Expected:** The oversized block is handled by the same per-tweet length/oversized rule
  that applies to an oversized paragraph today (no special-casing that drops or truncates
  it differently).

### TC-15 No supported blocks yields no content chunks
- **Precondition:** Introduction is empty (no blocks).
- **Action:** Generate X content.
- **Expected:** No content chunks are produced — unchanged from current behaviour.

## Security-relevant behaviour

### TC-16 Block text comes from DOM text, not raw markup
- **Precondition:** An introduction block (e.g. a list item or paragraph) contains an inline
  HTML element such as a `<script>` tag or an element with markup inside its text.
- **Action:** Generate LinkedIn and X content.
- **Expected:** Only the human-readable text content appears; raw HTML tags/markup do not
  propagate into the plain-text output.

### TC-17 Long/pathological code-block content completes promptly
- **Precondition:** A code block contains a long string of repeated whitespace and line
  breaks.
- **Action:** Generate content.
- **Expected:** Rendering completes without hanging (no catastrophic backtracking); the
  fenced output is produced for the given input.

status: ready
