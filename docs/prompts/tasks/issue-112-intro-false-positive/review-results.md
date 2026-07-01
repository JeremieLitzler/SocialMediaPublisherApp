# Review Results — Issue #112: Intro messaging + empty-introduction detection

Reviewed files (from `technical-specifications.md`):

- `src/composables/useArticleExtractor.ts`
- `src/utils/htmlExtractor.ts`
- `src/components/article/ManualIntroduction.vue`
- `tests/fixtures/english-no-intro.html`

## `rtk lint` / `npm run lint`

`rtk lint` could not run (`program not found` at the rtk wrapper level), so lint was invoked
via `npm run lint`. ESLint again fails to load its own configuration:

```
> eslint . --fix
Oops! Something went wrong! :(
ESLint: 9.39.2
SyntaxError: Unexpected token ':'
    at compileSourceTextModule (node:internal/modules/esm/utils)
    ...
```

Root cause is unchanged: `eslint.config.js:19` places `rules: {…}` as a bare `key: value`
entry inside the top-level array. This is a **pre-existing, repo-wide** breakage unrelated to
this change (the file is not in this diff) and is already tracked in a separate GitHub issue.
It blocks lint for every file, so no lint signal is available for the reviewed code.

## `npm run type-check`

Passed cleanly (no diagnostics):

```
> vue-tsc --build
```

## Checklist

- ✓ **Security rules.** R1: the two messages are fixed literals in a `const` map; the catch
  renders `MISSING_INTRODUCTION_MESSAGES[error.message]` only after `isMissingIntroductionCode`
  validates the code — no fetched HTML/URL/article text is interpolated. R2:
  `ManualIntroduction.vue` renders the message and copy via `{{ }}` (no `v-html`), so the literal
  `<h2>` is escaped. R3: `extractIntroduction` stays on DOM traversal (`querySelector`,
  `firstElementChild`/`nextElementSibling`); no `innerHTML` assignment or regex execution on the
  untrusted HTML (the fixture cleanup used a build-time script on test data, not runtime).
- ✓ **Object Calisthenics.** Two guard clauses replace the single null-check (no `else`); helpers
  (`isMissingIntroductionCode`) are small and single-purpose; the message map is a first-class
  constant; names are unabbreviated. `extractArticleData`'s trailing object literal is a single
  expression (acceptable).
- ✓ **Matches business spec.** R1/R2/R5 (no-`<h2>`/no-container → NO_HEADING message, unchanged);
  R3/R4 (first `<h2>` with empty intro → EMPTY message, distinct); R6 (manual-entry workaround
  preserved, static copy cause-agnostic). No scope creep — the `<h2>` boundary, tag set, and
  status values are untouched; only the empty-result mapping changed.
- ✓ **No dead code / unused imports / unreachable branches.** Both map keys are thrown and
  rendered; the `''` guard is reachable (the `english-no-intro.html` fixture triggers it); the
  old inline `MISSING_INTRODUCTION` message and single-cause check were fully replaced.
- ✓ **Naming clarity.** `MISSING_INTRODUCTION_MESSAGES`, `MissingIntroductionCode`,
  `isMissingIntroductionCode` — no abbreviations; existing `error`/`extractionState` retained.
- ✓ **Vue/TS pitfalls.** No reactive destructure (uses `extractionState.value`); no prop
  mutation; no `any`/`unknown`; no non-null `!`; the guard returns a proper
  `value is MissingIntroductionCode` predicate and uses `hasOwnProperty` (not `in`) to avoid
  prototype-chain false positives; exported functions keep explicit return types
  (`extractIntroduction: string | null`). Composable stays `use`-prefixed with no self-triggered
  fetch and no side effects needing cleanup.

status: approved
