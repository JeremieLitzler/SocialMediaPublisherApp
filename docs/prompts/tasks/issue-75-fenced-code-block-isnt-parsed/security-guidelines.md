# Security Guidelines — Issue #75: Fenced Code Block Isn't Parsed

## Scope

These rules apply to the change described in `business-specifications.md`: expanding `extractIntroduction` in `src/utils/htmlExtractor.ts` to retain `<pre>`, `<ul>`, and `<blockquote>` elements, and carrying that richer HTML through to the Medium and Substack outputs.

---

## Rules

### 1. DOMPurify allowlist must explicitly cover the three new element types

**What:** Verify that DOMPurify's default configuration permits `<pre>`, `<ul>`, `<li>`, and `<blockquote>` (and their expected nested children such as `<span>` inside `<pre>` for syntax highlighting) before the change ships. If the default configuration strips any of these tags, a permissive custom `ALLOWED_TAGS` option must be declared and documented.

**Where:** `src/components/platforms/PlatformMedium.vue` and `src/components/platforms/PlatformSubstack.vue` — specifically the `DOMPurify.sanitize` call that feeds `v-html`.

**Why:** DOMPurify's default allowlist is broad but not exhaustive. If a tag introduced by this fix is stripped silently, the rendered preview diverges from the copied HTML without warning, which could mislead the user. More importantly, any `<pre>` or `<blockquote>` element containing embedded active content (e.g. a `<script>` tag injected by a compromised upstream article) must be stripped. Confirming the allowlist covers the new tags — and that sanitization is applied — ensures the XSS surface described in ADR-007 remains fully mitigated as the HTML surface expands.

---

### 2. outerHTML serialisation must not bypass DOMPurify before the string reaches v-html

**What:** The `outerHTML` values captured from `<pre>`, `<ul>`, and `<blockquote>` elements in `extractIntroduction` must reach `v-html` only through the existing `DOMPurify.sanitize` computed property, with no intermediate string manipulation that could reintroduce stripped content.

**Where:** Data path from `src/utils/htmlExtractor.ts` → `src/utils/mediumContentGenerator.ts` / `src/utils/substackContentGenerator.ts` → `src/components/platforms/PlatformMedium.vue` and `PlatformSubstack.vue`.

**Why:** `outerHTML` captures the element's full serialised markup verbatim, including any active attributes (`onerror`, `onclick`, `javascript:` hrefs) that may be present in the source article HTML. If any layer in the pipeline concatenates, transforms, or re-embeds that string after DOMPurify has run, the sanitization is rendered ineffective. The sanitization gate must be the last transformation before binding.

---

### 3. Content copied to the clipboard must be the sanitized string, not the raw textarea value

**What:** The clipboard write operation must use `sanitizedBodyHtml` (the DOMPurify-processed value), not `rawBodyHtml` (the user-editable textarea value), as the `text/html` clipboard payload.

**Where:** `src/components/platforms/PlatformMedium.vue` and `src/components/platforms/PlatformSubstack.vue` — the `copyRenderedHtml` function and its `text/plain` fallback path.

**Why:** The expanded introduction may now contain `<pre>` blocks with nested `<span>` elements from syntax highlighters. A user could manually edit the textarea to embed malicious HTML. If the unsanitized textarea value is copied, an attacker who tricks a user into pasting into a trusted CMS could achieve stored XSS on the destination platform. The copy payload must always be the sanitized form.

---

### 4. The Netlify Function domain allowlist must not be relaxed

**What:** The `ALLOWED_DOMAINS` array in `netlify/functions/fetch-article.ts` must remain limited to `['iamjeremie.me', 'jeremielitzler.fr']`. This fix must not add, widen, or parameterise the allowlist.

**Where:** `netlify/functions/fetch-article.ts`.

**Why:** The introduction extraction now carries richer HTML structure. Allowing arbitrary domains would let an attacker craft a page whose introduction area contains a `<pre>` element with embedded active content, then submit that URL to the proxy. Even though DOMPurify mitigates the rendering risk, restricting the fetch surface at the network boundary limits the attack vector entirely.

---

### 5. The URL passed to the Netlify Function must be validated and protocol-restricted client-side before dispatch

**What:** Before calling `/.netlify/functions/fetch-article?url=...`, the URL value provided by the user must be validated to confirm it uses the `https:` scheme and that its hostname matches one of the two allowed domains. This validation must occur in the client layer, in addition to the server-side check in the Netlify Function.

**Where:** `src/composables/useArticleExtractor.ts` — the `fetchHTML` function or its caller.

**Why:** Defence in depth. The Netlify Function already rejects non-whitelisted domains, but client-side pre-validation prevents unnecessary round-trips and guards against accidental use of non-HTTPS URLs (e.g. `http://` or `file://`) that would transmit the HTML unencrypted before the function can reject the request. With richer HTML now being fetched, the confidentiality of the content in transit increases in importance.

---

### 6. No new external dependencies may be introduced by this change

**What:** The fix to `extractIntroduction` must rely exclusively on the existing `DOMParser`-provided `Document` API. No additional npm packages, CDN-loaded scripts, or external resources may be introduced.

**Where:** `src/utils/htmlExtractor.ts` and its test file.

**Why:** Each new dependency expands the supply-chain attack surface. `DOMParser` is a browser built-in with no installation footprint. A third-party HTML-parsing or sanitization library added here could introduce its own vulnerabilities, and would also require a new ADR justifying the dependency.

---

### 7. Test fixtures must not contain executable content

**What:** HTML strings used as test fixtures in the `htmlExtractor.ts` test file must not include `<script>` tags, event handler attributes, or `javascript:` URLs, even when the intent is to verify that such content is excluded from extraction output.

**Where:** `src/utils/htmlExtractor.test.ts`.

**Why:** Test fixtures are checked into the repository and executed in the Vitest environment. Even if the test asserts that active content is absent from output, the fixture itself could be misread as approved HTML patterns by future contributors, increasing the likelihood of unsafe content being introduced into production code. If negative tests for active content exclusion are needed, they belong in a dedicated DOMPurify integration test, not in the extraction unit tests.

---

### 8. The `outerHTML` of a `<pre>` element must not be re-serialised or decoded before sanitization

**What:** The extracted `outerHTML` string from a `<pre>` element must be treated as an opaque string that is concatenated with other such strings and passed as-is to the content generators. No HTML-entity decoding, base64 decoding, or template-string interpolation that could interpret the content must be applied before DOMPurify processes it.

**Where:** `src/utils/htmlExtractor.ts` (extraction), `src/utils/mediumContentGenerator.ts`, `src/utils/substackContentGenerator.ts` (assembly).

**Why:** `<pre>` elements often contain code with special characters (`<`, `>`, `&`) that are HTML-entity-encoded in the source. Decoding these entities before sanitization can reconstitute tag sequences that DOMPurify would otherwise see as plain text. This is a classic double-decode vector.

---

### ADR Required

**ADR: DOMPurify tag coverage verification for expanded HTML element types**

ADR-007 documents the decision to use DOMPurify to sanitize HTML before binding to `v-html`, and lists the tag set in use at the time of writing: `<figure>`, `<img>`, `<p>`, `<ul>`, `<li>`, `<h2>`, `<a>`, `<hr>`, `<figcaption>`, `<br>`. This change introduces `<pre>`, `<ul>` (already listed), `<blockquote>`, and potentially `<span>` (nested inside `<pre>` for syntax highlighting) as new elements flowing through the same sanitization path.

A new ADR (or an amendment to ADR-007) is required to:
- Confirm that DOMPurify's default configuration retains the three new element types and their expected children.
- Record the decision on whether the default configuration is sufficient or whether a custom `ALLOWED_TAGS` option is needed.
- Update the canonical tag list in ADR-007 to include `<pre>`, `<blockquote>`, and any nested tags.

This must be approved by a human before the coder proceeds with implementation.

---

status: ready
