# Review Results — Issue #125: Missing-introduction fallback

## Tooling output

### `rtk lint` / `npm run lint`

ESLint still cannot run in this environment. `rtk lint` reports the eslint binary is not found;
`npm run lint` (raw `eslint . --fix`) throws before linting any file because ESLint 9.39.2
cannot load its own flat config under the current Node toolchain:

```
Error: Failed to run eslint. Is it installed?   # rtk wrapper
---
> eslint . --fix                                 # npm script
Oops! Something went wrong! :(
ESLint: 9.39.2
SyntaxError: Unexpected token ':'
```

This is an environment/tooling issue, not a defect in the changed files. The changed source
and the new test files were reviewed manually against the relevant rules (unused imports,
`any`, explicit return types, naming) — no violations found.

### `npm run type-check` (vue-tsc --build)

Passes cleanly (exit 0, no diagnostics):

```
> vue-tsc --build
```

Note: the first run of this review surfaced two type errors in the newly authored
`src/components/article/ManualIntroduction.spec.ts` — the mock `ref(...)` was untyped, so
`status` widened to `string` (TS2322) and `article` narrowed to `never` (TS2339 on
`.introduction`). This is a mechanical test-typing omission I introduced in the test-authoring
phase; since `/jli-codes` may not touch test files, the only non-deadlocking resolution was to
correct it here. Fix applied: typed the ref as `ref<ExtractionState>(...)` (added the
`ExtractionState` type import). No production/source file was modified during review.

## Checklist

- ✓ **Security rule 1 (manual intro → v-html only via DOMPurify)** — Medium/Substack render the
  intro through `article.introduction` → `bodyHtml` → `sanitizeBodyHtml` (unchanged path);
  `toIntroductionHtml` additionally HTML-escapes so the intro is inert even pre-sanitizer.
- ✓ **Security rule 2 (text platforms auto-escaped, never v-html)** — X/LinkedIn render via
  `{{ }}` interpolation; escaping makes typed angle-bracket markup appear literally.
- ✓ **Security rule 3 (bound length)** — `MAX_MANUAL_INTRODUCTION_LENGTH` enforced by
  `maxlength` on the textarea and re-clamped in `toIntroductionHtml` before content generation.
- ✓ **Object Calisthenics** — Guard-clause/early-return, no `else`; small helpers
  (`rememberSelectedPlatform`, `completeRetainedArticle`, `openSelectedPlatform`,
  `resolveExtractionState`, `makeState`); domain shapes `ExtractionState`/`Article`; no
  abbreviations. `ref.value.prop` two-dot access and multi-binding `setup()` are the documented
  Vue-convention exceptions.
- ✓ **Matches business spec** — R1 (retain on EMPTY), R2 (no platform navigation on
  missing-introduction), R3 (manual entry when `article !== null`), R4 (NO_HEADING instruction
  only), R5 (complete + open remembered platform, no re-fetch), R6 (`selectedPlatform`
  remembered on both resolved states), R7 (index.vue reset + platform redirect untouched). No
  scope creep.
- ✓ **No dead code / unused imports** — Old error-code path removed; deleted the stale
  `ManualIntroduction.test.ts`; no dangling references.
- ✓ **Naming clarity** — Full words throughout; no abbreviations.
- ✓ **Vue/TS pitfalls** — State mutated via `extractionState.value` (no lossy destructuring);
  no watching of a reactive property; `article.introduction` mutated on shared singleton state,
  not a prop; `unknown` narrowed by `instanceof Error`; explicit return types on exported
  functions; no non-null `!`; composable is `use`-prefixed and does not self-trigger fetching.
- ⚠ **Tooling** — `type-check` green; `lint` cannot run due to an ESLint/Node environment
  issue unrelated to the implementation.

status: approved
