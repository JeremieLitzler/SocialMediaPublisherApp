# Review Results — Issue #80: Fenced Code DOMPurify Allowlist Extension

## Shell Command Results

### `npm run lint`

**Attempt 1 — `npm run lint`:**
```
> vue-boilerplate-jli@0.0.0 lint
> eslint . --fix

'eslint' is not recognized as an internal or external command,
operable program or batch file.
```
Exit code: 1

**Attempt 2 — `npx eslint . --fix`:**
```
npm warn exec The following package was not found and will be installed: eslint@10.0.3

Oops! Something went wrong! :(

ESLint: 10.0.3

SyntaxError: Unexpected token ':'
    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)
    at ModuleLoader.moduleStrategy (node:internal/modules/esm/translators:99:18)
    ...
```
Exit code: 1

**Root cause:** `node_modules` is absent from the worktree (not yet installed) and the project's `eslint.config.js` is incompatible with the globally/npx-resolved ESLint 10. This is documented as a pre-existing issue in the project memory: `npm run lint` fails in worktrees with `SyntaxError: Unexpected token ':'` in the ESLint config.

### `npm run type-check`

```
> vue-boilerplate-jli@0.0.0 type-check
> vue-tsc --build

'vue-tsc' is not recognized as an internal or external command,
operable program or batch file.
```
Exit code: 1

**Root cause:** `node_modules` is absent from the worktree. `vue-tsc` is not installed globally. This is the same environment constraint noted in the project memory for subagent worktrees on Windows/MINGW64.

**Shell command failures: 3/3 reached. No further shell commands were issued.**

The review below is based entirely on manual static analysis of the source files.

---

## Files Reviewed

- `src/utils/sanitize.ts`
- `src/utils/sanitize.test.ts`
- `src/utils/htmlExtractor.test.ts` (TC-07 additions)
- `src/components/platforms/PlatformMedium.vue`
- `src/components/platforms/PlatformSubstack.vue`
- `docs/decisions/ADR-007-html-sanitization-for-vhtml.md`
- `netlify/functions/fetch-article.ts` (verified unchanged)
- `tests/fixtures/organizing-specifications-with-claude-code.html` (verified present)

---

## Security Guidelines Verification

### Rule 1 — Active content remains blocked

`sanitize.ts` uses `ADD_TAGS` and `ADD_ATTR`, which are strictly additive to DOMPurify's default allowlist. The default allowlist already blocks `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, all `on*` event handlers, and `javascript:` URIs. Tests TC-08, TC-09, TC-10, TC-11, TC-12, TC-22, TC-23 all verify this explicitly. **Satisfied.**

### Rule 2 — Minimal allowlist traceable to observed output

`ADD_TAGS: ['table', 'tr', 'td', 'button']` and `ADD_ATTR: ['tabindex', 'data-lang']`. Each item is documented in the module comment with a direct reference to the fixture structure `div.highlight > div.chroma > table.lntable > tr > td > pre > code > span`. `tbody` is correctly omitted (the blog engine does not emit it; the tech spec explains this explicitly). **Satisfied.**

### Rule 3 — `class` allowed, `style` explicitly excluded

The `SANITIZE_CONFIG` does not add `style` to `ADD_ATTR`. `class` remains in DOMPurify's default allowlist. TC-13 asserts `style=` is stripped while `class="highlight"` is preserved. The ADR governance rule 3 documents this constraint. **Satisfied.**

### Rule 4 — `<button>` event handlers stripped

`ADD_TAGS: ['button']` allows the element to survive; DOMPurify's default behaviour strips all `on*` attributes even for added tags. TC-10 explicitly asserts `onclick` is absent from the button output. **Satisfied.**

### Rule 5 — Identical configuration between Medium and Substack

Both components import `sanitizeBodyHtml` from `@/utils/sanitize`. There is no inline DOMPurify call in either component. The single `SANITIZE_CONFIG` constant in `sanitize.ts` is the sole definition. TC-19 asserts deterministic identical output for repeated calls. **Satisfied.**

### Rule 6 — Fixture not served or executed as live HTML

`organizing-specifications-with-claude-code.html` is located under `tests/fixtures/`, which is outside `src/` and `public/`. Vite only processes files in `src/` (or explicitly configured entry points); `tests/fixtures/` is not a Vite entry point or a Netlify Function. The file is consumed only by `readFileSync` in `htmlExtractor.test.ts`. **Satisfied.**

### Rule 7 — Sanitization before both `v-html` and clipboard write

In both `PlatformMedium.vue` and `PlatformSubstack.vue`:
- `v-html="sanitizedBodyHtml"` — uses the computed value, not `rawBodyHtml`.
- `copyRenderedHtml()` calls `writeHtmlToClipboard(sanitizedBodyHtml.value)` and falls back to `navigator.clipboard.writeText(sanitizedBodyHtml.value)`. Neither path touches `rawBodyHtml` directly. **Satisfied.**

### Rule 8 — Netlify Function domain allowlist unchanged

`netlify/functions/fetch-article.ts` retains `ALLOWED_DOMAINS = ['iamjeremie.me', 'jeremielitzler.fr']` with no modifications. **Satisfied.**

---

## Object Calisthenics

No violations observed:
- `sanitize.ts` exports one function, uses named constants for config, no nested conditionals.
- Both platform components delegate all sanitization to the shared utility — no inline logic duplication.
- Test file uses one assertion per `it` block (the TC-01 describe block spreads assertions across distinct `it` cases rather than asserting multiple things in one test). Acceptable and intentional per the tech spec rationale.

---

## Business Specification Verification

| Rule | Verdict |
|------|---------|
| Rule 1 — Active content stripped | Satisfied — `ADD_TAGS`/`ADD_ATTR` preserves defaults; tests verify |
| Rule 2 — Minimal allowlist from observed output | Satisfied — each tag/attr traced to fixture |
| Rule 3 — Button may survive without interactivity | Satisfied — `button` in `ADD_TAGS`; `onclick` stripped by default |
| Rule 4 — Identical config between Medium and Substack | Satisfied — single shared module |
| Rule 5 — Fixture is actual fetched HTML | Satisfied — file present at `tests/fixtures/organizing-specifications-with-claude-code.html` |
| Rule 6 — Non-regression test asserts code text | Satisfied — TC-07 in `htmlExtractor.test.ts` asserts `'suggest plan to record specifications'` |
| Rule 7 — Clipboard copy uses sanitized HTML | Satisfied — `copyRenderedHtml` uses `sanitizedBodyHtml.value` in both components |

All examples (1–8) from the business spec are covered by test cases: fenced block survival (TC-01), active content stripped alongside fenced block (TC-08), inline event handler stripped (TC-09), medium/substack parity (TC-19), non-regression from live fixture (TC-07).

---

## No Dead Code, Unused Imports, or Unreachable Branches

- `sanitize.ts`: All constants (`FENCED_CODE_EXTRA_TAGS`, `FENCED_CODE_EXTRA_ATTRS`, `SANITIZE_CONFIG`) are used. The single export `sanitizeBodyHtml` is used in both platform components and the test file.
- `sanitize.test.ts`: All imports (`describe`, `it`, `expect`, `sanitizeBodyHtml`) are used.
- `htmlExtractor.test.ts`: The `organizingSpecificationsDoc` variable declared in the `beforeAll` scope is used in the TC-07 `describe` block. `beforeAll` is imported from Vitest and used.
- Both Vue components: All imports are used. No unreachable template branches.

No issues found.

---

## Naming Clarity

- `FENCED_CODE_EXTRA_TAGS`, `FENCED_CODE_EXTRA_ATTRS`, `SANITIZE_CONFIG` — intent is clear from name alone.
- `sanitizeBodyHtml(rawHtml)` — parameter name `rawHtml` is unambiguous; return type is `string`.
- `rawBodyHtml` / `sanitizedBodyHtml` in both platform components — the naming pair makes the sanitization boundary immediately visible.
- `organizingSpecificationsDoc` in the test — matches the article slug in the fixture filename.

No abbreviations or unclear names found.

---

## Vue / TypeScript Specific Issues

### Reactivity

`rawBodyHtml` is a `ref('')` updated via `watch` on `content.value?.bodyHtml`. The watch uses `{ immediate: true }` to populate the ref on mount. `sanitizedBodyHtml` is a `computed` wrapping `sanitizeBodyHtml(rawBodyHtml.value)`. This is the standard reactive-derived-value pattern; DOMPurify output is automatically re-computed when `rawBodyHtml` changes. The `v-model` on the textarea binds directly to `rawBodyHtml`, which also invalidates the computed correctly.

No reactivity pitfalls observed.

### Type Safety

`sanitizeBodyHtml` is typed `(rawHtml: string): string`. `DOMPurify.Config` is used for `SANITIZE_CONFIG`. Both platform components call `sanitizeBodyHtml(rawBodyHtml.value)` where `rawBodyHtml` is `Ref<string>`, so `.value` is correctly `string`. The `readonly string[]` type on the tag/attr constants prevents accidental mutation.

No type safety issues observed (manual analysis; `vue-tsc` could not be run due to missing `node_modules`).

### Composable Conventions

`sanitize.ts` is a pure utility module (not a composable) — it has no Vue lifecycle dependencies and correctly does not use the `use` prefix. This is appropriate: the `use` prefix is reserved for composables that use Vue's reactivity/lifecycle APIs.

---

## ADR Coverage

`docs/decisions/ADR-007-html-sanitization-for-vhtml.md` has been updated to document:
- The transition from inline default calls to the shared module
- The `ADD_TAGS`/`ADD_ATTR` extension with rationale for each tag/attribute
- Four governance rules for future allowlist changes
- Updated Consequences section

The security guidelines' ADR requirement is satisfied by this update rather than a new file, consistent with the technical spec rationale (evolutionary change to an existing decision).

---

## Summary

All security rules are verifiably satisfied in the changed files. The implementation matches the business specification without scope creep. No dead code, unused imports, or naming issues were found. Vue reactivity and TypeScript type patterns are correct. The ADR has been appropriately updated.

The only caveat is that `npm run lint` and `npm run type-check` could not be executed due to absent `node_modules` in the worktree (pre-existing environment constraint on MINGW64, documented in project memory). The static analysis found no issues that would be expected to generate lint or type errors.

status: approved
