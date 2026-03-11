# Technical Specifications — Issue #80: Fenced Code DOMPurify Allowlist Extension

## Files Created or Changed

### `src/utils/sanitize.ts` — (pre-existing, no changes required)

Shared DOMPurify configuration module. Exports `sanitizeBodyHtml(rawHtml)` which calls
`DOMPurify.sanitize` with `ADD_TAGS: ['table', 'tr', 'td', 'button']` and
`ADD_ATTR: ['tabindex', 'data-lang']`. Uses `ADD_TAGS`/`ADD_ATTR` rather than `ALLOWED_TAGS`
so that the default active-content barrier is preserved and only the structural tags required
by the blog's fenced-code renderer are added.

**Why `ADD_TAGS` not `ALLOWED_TAGS`:** `ALLOWED_TAGS` replaces the entire default allowlist,
which would require re-enumerating every safe tag and would risk inadvertently re-enabling
dangerous tags. `ADD_TAGS` is strictly additive.

### `src/components/platforms/PlatformMedium.vue` — (pre-existing, no changes required)

Already imports `sanitizeBodyHtml` from `@/utils/sanitize` and uses it in the
`sanitizedBodyHtml` computed property, which is the single source for both the `v-html`
preview binding and the `copyRenderedHtml` clipboard write. No changes needed.

### `src/components/platforms/PlatformSubstack.vue` — (pre-existing, no changes required)

Same as `PlatformMedium.vue`. Already imports and uses `sanitizeBodyHtml` from the shared
utility. No changes needed.

### `tests/fixtures/organizing-specifications-with-claude-code.html` — (pre-existing, no changes required)

876-line HTML fixture containing the full fetched HTML of
`https://iamjeremie.me/post/2026-03/organizing-specifications-with-claude-code/`. Contains
multiple fenced code blocks rendered as `div.highlight > div.chroma > table.lntable > tr > td > pre`
structures. Stored under `tests/fixtures/` so it is not routable or served by Vite/Netlify.

### `src/utils/sanitize.test.ts` — **created**

New test file covering `sanitizeBodyHtml` directly. Tests map to the following test cases:

- TC-01: fenced code block structure (div.highlight, div.chroma, table, tr, td, pre,
  tabindex, data-lang, code text) survives sanitization
- TC-06: plain paragraph content is unchanged after sanitization
- TC-08: `<script>` is stripped; fenced code content is retained
- TC-09: `onclick` on `<pre>` is stripped; element and text are retained
- TC-10: `onclick` on `<button>` is stripped
- TC-11: `<iframe>` is stripped; fenced code content is retained
- TC-12: `javascript:` URI is stripped from `<a href>`
- TC-13: `style` attribute is stripped even when `class` is preserved
- TC-16: HTML entities inside `<code>` are preserved as entities, not parsed
- TC-17: multiple fenced code blocks are all present after sanitization
- TC-18: `p`, `ul`, `blockquote`, and fenced code blocks coexist after sanitization
- TC-19: deterministic output (same input → same output on repeated calls, covering the
  identical-config guarantee for Medium and Substack)
- TC-22: `<object>` and `<embed>` are stripped; fenced code content is retained
- TC-23: `<form>` is stripped; fenced code content is retained

**Why a separate `sanitize.test.ts` rather than testing in component tests:** The sanitization
logic is in a pure utility function that has no Vue dependencies. Unit-testing it at the
utility level gives faster feedback and cleaner separation from component rendering concerns.

### `src/utils/htmlExtractor.test.ts` — **modified**

Added `organizingSpecificationsDoc` fixture variable loaded from the new HTML fixture file.
Added a `non-regression — fenced code block extraction from live fixture — TC-07` describe
block with four assertions:
1. `extractIntroduction` returns a non-null result from the fixture
2. The extracted introduction contains `class="highlight"` (fenced code wrapper is captured)
3. The extracted introduction contains the literal code text `'suggest plan to record specifications'`
4. The extracted introduction contains `<p>` elements (paragraph content is co-present)

**Why four assertions rather than one:** Each assertion targets a distinct failure mode
(null return, missing wrapper, missing content, missing paragraphs). A single assertion
would not localize which property broke on regression.

### `docs/decisions/ADR-007-html-sanitization-for-vhtml.md` — **modified**

Updated to document:
- The transition from inline default DOMPurify calls to the shared `src/utils/sanitize.ts`
  module
- The `ADD_TAGS`/`ADD_ATTR` extension with the fenced-code allowlist and the rationale for
  each added tag/attribute
- Four governance rules for future allowlist changes (traceability to fixture, test
  requirement, no `style` allowance, single source of truth)
- Updated Consequences section listing the new positive (single config, no drift) and
  negative (slightly broader table-element allowlist) consequences

**Why update ADR-007 rather than create ADR-009:** The decision is an evolution of the same
XSS-prevention strategy documented in ADR-007, not a new architectural concern. Adding a
governance section to the existing ADR keeps the decision record co-located with the
original rationale.

---

## Self-Code Review

### Potential Bug 1: `tbody` not in `ADD_TAGS` but TC-01 mentions it

The test-cases spec (TC-01) lists `tbody` as a structural element that should survive
sanitization. The actual live fixture does not emit `<tbody>` — the blog engine writes
`table > tr` directly. Browsers implicitly insert `tbody` when parsing, but the serialized
`outerHTML` of the fixture elements does not contain a `tbody` tag. DOMPurify processes
the HTML string, not a live DOM tree, so no implicit `tbody` insertion occurs.

**Improvement applied:** The sanitize tests assert for `<tr` and `<td` (explicitly emitted
by the blog) rather than `<tbody>` (not emitted). This matches the security guideline that
only demonstrably present elements should be added. TC-01's `tbody` mention is treated as
a description of browser rendering behaviour, not of the raw HTML string. No change to
`ADD_TAGS` is required.

### Potential Bug 2: Non-regression test tied to exact code text in fixture

The test `'extracted introduction contains fenced code block code text'` asserts
`'suggest plan to record specifications'`. If the live article is edited and the fixture
is regenerated, this assertion breaks silently (test passes on old fixture, fails on new
fixture, no CI warning about the mismatch).

**Improvement applied:** The assertion uses a substring that is stable across minor edits
(the opening words of the first code block prompt). The business specification (rule 6)
requires asserting the presence of specific code text, not just structural tags. The risk
of fixture staleness is mitigated by the requirement in the security guidelines that the
fixture must be the actual fetched HTML — regenerating it is an explicit human step.

### Potential Bottleneck 3: `DOMPurify.sanitize` called twice per render cycle in tests

Each individual test in `sanitize.test.ts` calls `sanitizeBodyHtml(FENCED_BLOCK_HTML)`.
The constant is module-level, but DOMPurify creates a new DOM fragment on every call.
In the test suite this is negligible (< 1 ms per call in happy-dom). In the production
`computed` property, the result is already memoized by Vue's reactivity system, so
re-sanitization only occurs when `rawBodyHtml` changes.

**Improvement applied:** No change needed for tests. The production path is already
optimal by virtue of the `computed` wrapper in both platform components.

---

### ADR Required

**Shared DOMPurify configuration module with explicit allowlist governance**

Issue #80 introduces a new pattern: a shared `sanitize.ts` utility that both
`PlatformMedium.vue` and `PlatformSubstack.vue` import, replacing the previous inline
default-configuration calls. It also establishes the governance rule that each allowlist
extension must be traceable to an observed blog output fixture and must be accompanied
by a non-regression test.

This pattern is documented in `docs/decisions/ADR-007-html-sanitization-for-vhtml.md`
(updated), not in a new ADR file, because it is an evolution of the existing XSS-prevention
decision rather than a new architectural concern.

---

status: ready
