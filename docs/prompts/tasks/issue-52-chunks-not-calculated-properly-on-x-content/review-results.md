# Review Results — Issue 52: Chunks Not Calculated Properly on X Content

## Files Reviewed

- `src/types/article.ts`
- `src/utils/xContentGenerator.ts`
- `src/components/platforms/PlatformX.vue`
- `src/utils/xContentGenerator.test.ts`

---

## Tool Output

### `npm run lint`

```
> vue-boilerplate-jli@0.0.0 lint
> eslint . --fix

Oops! Something went wrong! :(

ESLint: 9.39.3

SyntaxError: Unexpected token ':'
    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)
    ...
```

**Note:** This error is pre-existing and caused by a structural bug in `eslint.config.js` (a bare `rules:` object is placed as a top-level array element instead of inside a config entry object). This bug predates issue 52 and is not introduced by the changes under review. ESLint could not run against the changed files.

### `npm run type-check`

```
> vue-boilerplate-jli@0.0.0 type-check
> vue-tsc --build
```

No errors. Type-check passes cleanly.

---

## Security Checklist

All six security rules from `security-guidelines.md` are addressed:

- **Rule 1 (textContent only):** `extractParagraphTexts` in `xContentGenerator.ts` reads `node.textContent` exclusively — `innerHTML` is never accessed.
- **Rule 2 (no v-html):** `PlatformX.vue` uses `{{ chunk.text }}` interpolation inside `<pre>`, not `v-html`.
- **Rule 3 (static warning string):** The warning message in `PlatformX.vue` (line 67-69) is a hardcoded string literal in the template — not derived from any data property, computed value, or article content.
- **Rule 4 (warning excluded from clipboard):** `CopyButton` receives `:text="chunk.text"` only; the warning `<p>` is a separate sibling element and its content is never concatenated into the copy payload.
- **Rule 5 (oversized flag from length only):** In `buildRawChunksFromParagraph`, `oversized: true` is set solely by comparing `paragraphText.length` against `MAX_CHUNK_LENGTH` — no value from article HTML influences the flag.
- **Rule 6 (no new runtime dependencies):** Only `DOMParser` (browser-native) and existing project utilities are used. No new npm packages were added.

---

## Business Spec Checklist

- **Rule 1 (paragraph-first chunking):** Each `<p>` element is processed independently by `buildRawChunksFromParagraph`; paragraphs are never merged into a shared chunk.
- **Rule 2 (sentence boundary splitting):** `splitIntoSentences` and `buildChunksFromSentences` implement sentence accumulation splitting at `. `, `! `, and `? `.
- **Rule 3 (oversized flag):** Set in `buildRawChunksFromParagraph` when paragraph length exceeds 280 and no sentence boundary exists.
- **Rule 4 (orange border + warning message):** `:class="{ 'border-orange-500': chunk.oversized }"` and `v-if="chunk.oversized"` warning `<p>` are present in `PlatformX.vue`.
- **Rule 5 (unchanged formatting for non-oversized chunks):** `formatChunks` appends `\n\n⬇️` to non-last chunks and `\n\n⬇️⬇️⬇️\n{utmLink}` to the last chunk; `oversized` flag is preserved through formatting unchanged.
- **Rule 6 (chunk count label):** `chunkCountLabel` computed in `PlatformX.vue` appends `, {n} oversized` when `oversizedCount > 0`; shows only the total when no oversized chunks exist.

---

## Test File Checklist

- **`chunk.text` used in all string assertions:** All previously failing string-method calls (`endsWith`, `includes`, `replace`, `toContain`, `toBe`) now correctly reference `chunk.text`, `lastChunk.text`, `result.chunks[0].text`, etc. No direct method calls on `XChunk` objects remain.
- **Paragraph-first chunking tests:** `describe('paragraph-first chunking', ...)` block (line 224) covers two-paragraph splitting and each paragraph remaining independent.
- **Oversized flag assignment:** Test at line 259 asserts `result.chunks[0].oversized` is `true` for a paragraph exceeding 280 chars with no sentence boundary.
- **Warning text exclusion from chunk text:** Test at line 271 asserts no chunk's `.text` field contains the warning message keywords (`'oversized'`, `'warning'`, `'exceeds'`).
- **No sentence-boundary paragraphs without oversized flag:** Test at line 238 asserts all chunks from a long paragraph that has sentence boundaries carry a falsy `oversized` value.

---

## Object Calisthenics Checklist

- No `else` keyword in `xContentGenerator.ts` or `PlatformX.vue`.
- Each function in `xContentGenerator.ts` has a clear single responsibility. The `buildChunksFromSentences` function is the longest at ~26 lines but contains no internal branching complexity beyond a single `for` loop — consistent with the existing codebase style.
- No abbreviations in exported or module-level names.
- No dead code or unused imports in any changed file.
- Naming is clear throughout: `extractParagraphTexts`, `hasSentenceBoundary`, `buildRawChunksFromParagraph`, `buildChunksFromSentences`, `formatChunks`, `oversizedCount`, `chunkCountLabel`.

---

## Summary

All findings from the previous review have been resolved. The test file now uses `chunk.text` (and equivalent `.text` accesses) in every string assertion. The four new test cases covering paragraph-first chunking, sentence-boundary splitting without oversized flag, oversized flag assignment, and warning text exclusion from chunk text are present and correctly structured. The type-check passes with no errors.

The pre-existing ESLint config bug (`eslint.config.js`) is the only known issue and predates this change.

status: approved
