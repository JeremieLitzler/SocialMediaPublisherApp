# Review Results — Issue #112: Intro "false positive" messaging

Reviewed files (from `technical-specifications.md`):

- `src/composables/useArticleExtractor.ts`
- `src/components/article/ManualIntroduction.vue`

No `security-guidelines.md` exists for this task (messaging-only change; the business spec
states no new security surface). Security checklist is therefore N/A.

## `rtk lint` / `npm run lint`

`rtk lint` could not run (`program not found` at the rtk wrapper level), so lint was invoked
via `npm run lint`. ESLint failed to load its own configuration:

```
> eslint . --fix
Oops! Something went wrong! :(
ESLint: 9.39.2
SyntaxError: Unexpected token ':'
    at compileSourceTextModule (node:internal/modules/esm/utils)
    ...
```

Root cause: `eslint.config.js:19` places `rules: { 'vue/multi-word-component-names': 0 }` as a
bare element of the top-level array (`export default [ … ]`). A `key: value` pair is not valid
inside an array literal, which produces the `Unexpected token ':'` parse error. It should be
wrapped as its own config object:

```js
// current (invalid)
export default [
  ...vueTsEslintConfig(),
  skipFormatting,
  rules: {
    'vue/multi-word-component-names': 0
  }
]

// expected
export default [
  ...vueTsEslintConfig(),
  skipFormatting,
  {
    rules: {
      'vue/multi-word-component-names': 0,
    },
  },
]
```

**Scope note:** `eslint.config.js` is NOT part of this change (not in the technical spec, not
in the issue-112 commit) — this is a pre-existing, repo-wide tooling breakage that predates the
change under review and blocks lint for every file, not just the two edited here. It is out of
scope for a messaging fix and should be routed as its own `fix(ci)`/`ci` task. It does not
reflect a defect in the reviewed code.

## `npm run type-check`

Passed cleanly (no diagnostics):

```
> vue-tsc --build
```

## Checklist

- ✓ **Security rules** — N/A (no `security-guidelines.md`; messaging-only, no new input,
  network, or sink surface). The reworded strings are static literals rendered via `{{ }}`
  (auto-escaped) and a `<code>&lt;h2&gt;</code>` literal — no interpolated/user data, no XSS.
- ✓ **Object Calisthenics** — diff is two static-string edits; no new methods, classes,
  indentation levels, `else`, or abbreviations introduced. Existing small-entity structure
  preserved.
- ✓ **Matches business spec** — R2/TC-2: message names the missing-`<h2>` cause, states the
  introduction end can't be located, directs the author to use `<h2>`, and drops the false
  "no paragraphs" claim. R3/TC-4: `ManualIntroduction.vue` copy agrees and still offers manual
  entry as the workaround. R4/TC-3: the missing-`.article-content` path funnels through the
  same `MISSING_INTRODUCTION` branch and inherits the same message — no separate flow. R1/TC-5/
  TC-6: detection untouched. No scope creep (detection, state values, tag set unchanged).
- ✓ **No dead code / unused imports / unreachable branches** — no imports changed; the
  `MISSING_INTRODUCTION` branch already existed and still `return`s.
- ✓ **Naming clarity** — no abbreviations introduced; existing `error`/`extractionState`/
  `canContinue`/`handleContinue` names are unabbreviated.
- ✓ **Vue/TS pitfalls** — `useArticleState()` is accessed via `extractionState.value` (no
  reactivity-losing destructure of the ref's contents); no props mutated; no `any`/`unknown`;
  no non-null `!`; `handleContinue` uses a guard-clause early return; composable is `use`-
  prefixed; no new side effects requiring cleanup. `{{ extractionState.error }}` renders the
  literal `<h2>` text safely (escaped).

status: approved
