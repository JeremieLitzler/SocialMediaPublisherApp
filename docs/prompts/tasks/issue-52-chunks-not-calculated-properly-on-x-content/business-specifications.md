# Business Specifications — Issue 52: Chunks Not Calculated Properly on X Content

## Context

When an article introduction contains multiple HTML `<p>` paragraphs, the current X content generator merges them into a single plain text string before chunking. This causes distinct paragraphs to be collapsed together, producing incorrect chunk boundaries. The fix must preserve paragraph structure as the primary chunking unit.

## Rules

### Rule 1 — Paragraph-first chunking

Each HTML `<p>` paragraph in the article introduction is treated as an independent unit. One paragraph produces one or more chunks, never fewer.

No content from paragraph A can appear in the same chunk as content from paragraph B.

### Rule 2 — Long paragraph splitting at sentence boundaries

If a paragraph's plain text exceeds 280 characters, it is split into multiple chunks by accumulating sentences until the next sentence would push the chunk over 280 characters. Sentence boundaries are detected at `. ` (period-space), `! ` (exclamation-space), and `? ` (question-space).

The chunk is emitted when the next sentence would exceed 280 characters, and a new chunk starts with that next sentence. This continues until all sentences of the paragraph have been placed.

### Rule 3 — Oversized paragraph with no sentence boundary

If a paragraph exceeds 280 characters and contains no sentence boundary (`. `, `! `, `? `), the entire paragraph becomes a single chunk and that chunk is marked with an oversized warning flag.

### Rule 4 — Visual display of oversized chunk warning

A chunk that carries an oversized warning flag must be displayed with:

- An orange border (`border-orange-500`) surrounding the chunk card.
- A warning message rendered below the chunk text content, inside the chunk card.

The warning message text is: "This chunk exceeds 280 characters and could not be split. Consider adapting it before posting."

The warning message is informational only. It is excluded from what is copied when the user activates the copy action for that chunk.

### Rule 5 — Unchanged formatting rules for non-oversized chunks

All existing formatting behaviour remains in place:

- Every chunk except the last receives a downward arrow appended after its content.
- The last chunk receives a triple downward arrow followed by the UTM-tagged article link appended after its content.
- These appended elements are part of the copyable chunk text.

### Rule 6 — Chunk count label calls out oversized chunks

The chunk count label displayed to the user must distinguish oversized chunks from normal chunks. For example: "4 chunks to post, 1 oversized".

If no chunks are oversized, only the total is shown: "4 chunks to post".

## Examples

### Example 1 — Two short paragraphs, each fits in one chunk

**Given** an introduction with two `<p>` elements, each 120 characters long.

**When** X content is generated.

**Then** two chunks are produced: one per paragraph. The first chunk ends with the downward arrow. The second chunk ends with the triple arrow and the UTM link. The chunk count label reads "2 chunks to post".

### Example 2 — One paragraph that fits within 280 characters

**Given** an introduction with a single `<p>` element whose plain text is 200 characters.

**When** X content is generated.

**Then** one chunk is produced containing the paragraph text plus the triple arrow and UTM link. The chunk count label reads "1 chunk to post".

### Example 3 — One long paragraph split at sentence boundaries

**Given** an introduction with a single `<p>` element whose plain text is 420 characters containing three sentences separated by `. `.

**When** X content is generated.

**Then** the paragraph is split across two chunks. The first chunk accumulates sentences until the next would exceed 280 characters. The second chunk holds the remaining sentences. No oversized flag is set on either chunk. The chunk count label reads "2 chunks to post".

### Example 4 — Long paragraph with no sentence boundary

**Given** an introduction with a single `<p>` element whose plain text is 350 characters and contains no `. `, `! `, or `? ` sequence.

**When** X content is generated.

**Then** one chunk is produced with the full 350-character text and an oversized warning flag. The chunk card displays an orange border (`border-orange-500`) and the warning message "This chunk exceeds 280 characters and could not be split. Consider adapting it before posting." below the chunk text. Copying the chunk copies only the chunk text (plus the UTM arrow/link), not the warning message. The chunk count label reads "1 chunk to post, 1 oversized".

### Example 5 — Mixed paragraphs: one short, one long with boundary, one oversized

**Given** an introduction with three `<p>` elements:
- Paragraph 1: 150 characters, no splitting needed.
- Paragraph 2: 400 characters, contains two `. ` boundaries producing two sub-chunks.
- Paragraph 3: 310 characters, no sentence boundary, requires an oversized flag.

**When** X content is generated.

**Then** four chunks are produced in order: chunk from paragraph 1, two chunks from paragraph 2, one oversized chunk from paragraph 3. The last chunk (from paragraph 3) carries the triple arrow and UTM link, plus the oversized warning flag. Chunks from paragraph 1 and the first sub-chunk of paragraph 2 carry the downward arrow. The chunk count label reads "4 chunks to post, 1 oversized".

### Example 6 — Empty introduction

**Given** an introduction with no `<p>` elements or an empty introduction string.

**When** X content is generated.

**Then** zero chunks are produced.

### Example 7 — Warning message is not copied

**Given** an oversized chunk (Rule 3) is displayed with its warning message.

**When** the user activates the copy action for that chunk.

**Then** only the chunk text (and its arrow/UTM suffix) is placed in the clipboard. The warning message text is not included.

### Example 8 — UTM link on last oversized chunk

**Given** an introduction where the last chunk produced is oversized.

**When** X content is generated.

**Then** the last chunk carries both the triple arrow + UTM link and the oversized warning flag. Both apply simultaneously.

status: ready
