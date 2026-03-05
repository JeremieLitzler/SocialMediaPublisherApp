# Security Guidelines — Issue 52: Chunks Not Calculated Properly on X Content

## Rules

### Rule 1 — Extract paragraph text using `textContent`, never `innerHTML`

**What:** When iterating over `<p>` elements parsed from the article introduction HTML, read each paragraph's plain text via the DOM `textContent` property only. Do not read or forward `innerHTML` from those elements into any chunk string.

**Where:** The utility function that replaces the current `htmlToText` call in `xContentGenerator.ts` — specifically wherever `<p>` nodes are queried and their content read.

**Why:** The introduction HTML originates from a remote server response fetched through the Netlify CORS proxy. Although the domain whitelist restricts which origins are accepted, the fetched content is still untrusted third-party HTML. Reading raw `innerHTML` from parsed nodes and placing it into chunk strings creates a path for injected HTML or script fragments to propagate into reactive state. Using `textContent` ensures only the decoded character data is extracted, stripping all markup at the point of extraction.

---

### Rule 2 — Do not bind chunk strings to `v-html`

**What:** Chunk strings (the copyable text placed in `XContent.chunks`) must never be bound to Vue's `v-html` directive in `PlatformX.vue` or any other template that renders chunk content.

**Where:** `PlatformX.vue` template, and any future component that renders X chunk content.

**Why:** Chunk strings are assembled from `textContent` values and therefore contain plain text, but if the rendering path is ever changed to `v-html`, any HTML that survived earlier processing steps would execute in the browser. The existing `<pre>` + text interpolation (`{{ chunk }}`) pattern is correct and must be preserved. ADR-007 establishes that `v-html` requires DOMPurify sanitization; this rule avoids the risk entirely by keeping the render path HTML-free.

---

### Rule 3 — Render the oversized warning message as a static string literal, not from data

**What:** The warning message text "This chunk exceeds 280 characters and could not be split. Consider adapting it before posting." must be a hardcoded string in the template or component, not a value read from the chunk object, a computed property derived from external input, or a server-supplied string.

**Where:** `PlatformX.vue` template, in the conditional block that displays the warning for oversized chunks.

**Why:** The warning is a fixed informational message defined by the business specification. Deriving it from data — even from a field on the chunk object — introduces a code path where an unexpected value (originating from malformed article HTML) could reach the rendered UI. A static literal has no such attack surface.

---

### Rule 4 — Exclude the warning message from all clipboard write operations

**What:** The string passed to the copy action for a chunk must contain only the chunk's copyable text (content plus arrow/UTM suffix). The warning message string must never be concatenated into, or otherwise included in, the value written to the clipboard.

**Where:** The copy handler in `PlatformX.vue` (currently using `CopyButton` with a `:text` binding).

**Why:** If warning text were included in the clipboard payload, a user pasting into a social platform would publish the warning as part of the post. Beyond the user-facing impact, this also ensures the clipboard write path is driven solely by the structured chunk data and not by any UI-layer string that could be influenced by unexpected content in the article.

---

### Rule 5 — The `oversized` flag must be a boolean derived only from chunk length, not from article content

**What:** The oversized marker on a chunk object must be set exclusively by comparing the raw plain-text length of the chunk against the 280-character limit. It must not be read from, inferred from, or influenced by any value present in the source HTML.

**Where:** The chunking logic in `xContentGenerator.ts` (or the utility it delegates to).

**Why:** If the flag were derived from a field in the article HTML (e.g., a class name or attribute), a malicious or malformed page could artificially set or suppress the flag. Keeping the flag as a pure boolean computed from string length closes this vector and keeps the security-relevant branching logic deterministic and testable.

---

### Rule 6 — No new external runtime dependencies may be introduced

**What:** The implementation must use only browser-native APIs (`DOMParser`, DOM node properties) and existing project utilities. No new npm packages may be added to handle HTML parsing, text extraction, or chunk structuring.

**Where:** `xContentGenerator.ts`, `htmlToText.ts`, and any new utility files created for this issue.

**Why:** Each new dependency expands the supply-chain attack surface. The browser's native `DOMParser` already provides a sandboxed parsing environment sufficient for extracting `textContent` from `<p>` elements. Adding a third-party HTML parser for this purpose would introduce unreviewed code into the trusted execution path without a corresponding security gain.

---

status: ready
