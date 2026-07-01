# Review Results — Issue #113: Introduction list extraction

## Tooling output

### `rtk lint` / `npm run lint`

Lint could **not** run. `rtk lint` reports eslint not found in this shell; `npm run lint`
fails while loading the repo's flat config — not on the changed source:

```
Oops! Something went wrong! :(
ESLint: 9.39.2
SyntaxError: Unexpected token ':'
    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)
    ...
```

Root cause is pre-existing and out of scope: `eslint.config.js:19` places `rules:` as a bare
property inside the exported **array** literal (`export default [ …, rules: { … } ]`), which is
invalid JS. It should be a config object `{ rules: { … } }`. Line 1 also imports an unused
`{ rules }` from `eslint-plugin-vue`. `git diff develop...HEAD -- eslint.config.js` is empty and
the file's last change is commit `ff9ad0b (feat: initialize project #1)` — this branch did not
introduce the breakage, but linting cannot verify the changed files until it is fixed.

### `npm run type-check` (`vue-tsc --build`)

Passed cleanly — no diagnostics.

```
> vue-tsc --build
```

## Checklist

- **Security guidelines fully addressed** — ✓
  - Rule 1 (build from DOM text, not raw markup): ✓ — `parseIntroductionHtml` uses `DOMParser`,
    strips `script`/`style`, every builder reads `textContent`/child text; no markup is
    concatenated into output.
  - Rule 2 (no `v-html`/`innerHTML` sink for LinkedIn/X): ✓ — generators return plain strings.
    The only `v-html` uses are `PlatformMedium.vue:141` and `PlatformSubstack.vue:120`, both
    bound to `sanitizedBodyHtml` (out of scope, sanitized path unchanged).
  - Rule 3 (ReDoS-bounded whitespace/code processing): ✓ — `stripOuterBlankLines` uses
    `/^[\r\n]+/` and `/\s+$/`, `collapseWhitespace` uses `/\s+/g`; all single, non-nested
    quantifiers — linear time.

- **Object Calisthenics** — ✓ (minor)
  - Guard-clause style, no `else`, small single-purpose functions, domain types
    (`IntroductionBlock`, `RawChunk`). Minor: `doc` / `raw` abbreviations and a couple of
    two-dot chains (`element.classList.contains`, `.split().map().filter()`) — idiomatic,
    non-blocking.

- **Matches business spec — no missing requirements** — ✗ (see finding 1)
  - Rules 1, 2, 4, 5, 6, 7, 8, 9 verified in code. **Rule 3 (ordered lists) is not delivered
    end-to-end** — details below.

- **No dead code / unused imports** — ✗ (see finding 2)

- **Naming clarity** — ✓ — `index`, `element`, `sentence`, `paragraphText`; no `btn/idx/res/err`.

- **Vue/TS pitfalls** — ✓ (mostly N/A)
  - Pure util modules, no reactivity/composables/props/lifecycle — reactivity pitfalls do not
    apply. Exported functions carry explicit return types (`IntroductionBlock[]`,
    `LinkedInContent`, `XContent`). No `any`/`unknown`; the single `as Element` cast in
    `nodeText` is guarded by a prior `nodeType === Node.ELEMENT_NODE` check; nullish access
    uses `?? ''`, no non-null `!`.

## Findings

### 1. Ordered lists are dropped before reaching the generators (blocking)

The business spec goal names "unordered lists, **ordered lists**, blockquotes, or code blocks"
in scope, and rule 3 requires `<ol>` items to render numbered. `articleHtmlBuilder.ts` correctly
implements `orderedListBlock` and maps `OL` in `BLOCK_BUILDERS`. However, the upstream extraction
that produces `article.introduction` excludes `OL`:

```
src/utils/htmlExtractor.ts:66
const INTRODUCTION_ELEMENT_TAGS = new Set(['P', 'PRE', 'UL', 'BLOCKQUOTE'])
```

`extractIntroduction` → `collectIntroductionElements` → `isIntroductionElement` therefore never
emits an `<ol>` into the introduction HTML string the generators consume. Net effect end-to-end:
`orderedListBlock` is unreachable in production and a real article's ordered list is silently
dropped from LinkedIn and X — the exact defect this issue exists to fix, for one of the four
declared block types.

The technical spec flags this as a "non-blocking" discrepancy on the grounds that
`htmlExtractor.ts` is outside the declared file scope, and the test cases feed OL HTML to the
generators directly (so TC-03 passes in isolation). But the business spec's own premise — "the
existing extraction already retains them" — is factually wrong for `<ol>`, so satisfying the
stated goal requires the one-line change. Recommend adding `'OL'` to `INTRODUCTION_ELEMENT_TAGS`
and updating the CLAUDE.md "HTML Extraction Selectors" list to include `<ol>`, or obtaining an
explicit product decision to descope ordered lists (in which case the spec goal and rule 3 should
be amended and `orderedListBlock` removed).

### 2. `extractParagraphTexts` is now dead production code (minor)

`extractParagraphTexts` (`articleHtmlBuilder.ts:55`) is no longer referenced by any generator —
LinkedIn and X now use `extractIntroductionBlocks`. A repo-wide search finds it only at its own
definition and in `articleHtmlBuilder.spec.ts`. The technical spec kept it "untouched"
deliberately, but as shipped it is exported-but-unused production code kept alive solely by its
test. Confirm no pending consumer; otherwise remove it (and its spec) or document why it is
retained.

status: changes requested
