# Review Results — Issue #113: Introduction list extraction

## Tooling output

### `rtk lint` / `npm run lint`

Lint could **not** run — unchanged from prior rounds. `rtk lint` reports eslint not found in
this shell; `npm run lint` fails while loading the repo's flat config, not on the changed
source:

```
Oops! Something went wrong! :(
ESLint: 9.39.2
SyntaxError: Unexpected token ':'
    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)
    ...
```

Root cause is pre-existing and out of scope: `eslint.config.js` places `rules:` as a bare
property inside the exported **array** literal, which is invalid JS. `git diff develop...HEAD
-- eslint.config.js` is empty — this branch did not introduce the breakage. Linting cannot
verify the changed files until it is fixed, but this is unrelated to issue #113.

### `npm run type-check` (`vue-tsc --build`)

Passed cleanly — no diagnostics.

```
> vue-tsc --build
```

## Checklist

- **Security guidelines fully addressed** — ✓
  - Rule 1 (build from DOM text, not raw markup): ✓ — `parseIntroductionHtml` parses via
    `DOMParser` and strips `script`/`style`; every builder reads `textContent` / child text
    (`paragraphBlock`, `listItemTexts`, `elementLines`, `codeBlock`). No `outerHTML`/
    `innerHTML` is concatenated into output.
  - Rule 2 (no `v-html`/`innerHTML` sink for LinkedIn/X): ✓ — generators return plain
    strings; `PlatformLinkedIn.vue:44` and `PlatformX.vue:65` render them with `{{ }}` text
    interpolation inside `<pre>`. The only `v-html` uses (`PlatformMedium.vue:141`,
    `PlatformSubstack.vue:120`) are bound to `sanitizedBodyHtml` and are out of scope.
  - Rule 3 (ReDoS-bounded whitespace/code processing): ✓ — `stripOuterBlankLines` uses
    `/^[\r\n]+/` and `/\s+$/`; `collapseWhitespace` uses `/\s+/g`. All single, non-nested
    quantifiers — linear time.

- **Object Calisthenics** — ✓ (minor)
  - Guard-clause style, no `else`, small single-purpose functions, domain types
    (`IntroductionBlock`, `RawChunk`). Minor idiomatic exceptions: `doc`/`raw` abbreviations
    and a few two-dot chains (`element.classList.contains`, `.split().map().filter()`) —
    non-blocking.

- **Matches business spec — no missing requirements** — ✓
  - Rule 1 (source order): `extractIntroductionBlocks` walks `body.children` in document
    order. Rules 2–5: `unorderedListBlock` (`- `), `orderedListBlock` (`1. `), `blockquoteBlock`
    (`> `), `codeBlock` (fenced, whitespace preserved). Rule 6: empty blocks return `null` and
    are skipped. Rule 7: LinkedIn joins with `\n\n`, separator + UTM tail unchanged. Rule 8:
    non-paragraph blocks are atomic chunks (`buildRawChunksFromAtomicBlock`), oversized flagged.
    Rule 9: empty introduction yields `[]` / tail-only. The `<ol>` extraction gap is resolved —
    `INTRODUCTION_ELEMENT_TAGS` includes `'OL'` (`htmlExtractor.ts:66`).

- **No dead code / unused imports** — ✓
  - The previously-flagged `extractParagraphTexts` is removed from `articleHtmlBuilder.ts` and
    its spec (no remaining references repo-wide). The stale module header comment is fixed —
    `articleHtmlBuilder.ts:1-9` now describes the figure/separator helpers plus
    `extractIntroductionBlocks`, matching the code.

- **Naming clarity** — ✓ — `index`, `element`, `sentence`, `paragraphText`, `listItemTexts`;
  no `btn/idx/res/err`.

- **Vue/TS pitfalls** — ✓ (mostly N/A)
  - Pure util modules; no reactivity/composables/props/lifecycle. Exported functions carry
    explicit return types (`IntroductionBlock[]`, `LinkedInContent`, `XContent`). No
    `any`/`unknown`; the single `as Element` cast in `nodeText` is guarded by a prior
    `nodeType === Node.ELEMENT_NODE` check; nullish access uses `?? ''`, no non-null `!`.

status: approved
