# Review Results — Issue #132: localized Medium read-article anchor (re-review)

## Shell command output

### `rtk lint`

`rtk lint` cannot invoke the linter in this environment (`Failed to run eslint … program not
found`), so `npm run lint` (the underlying `eslint . --fix`) was run instead.

1967 errors are reported, but **all are in generated build artifacts under
`.netlify/functions-serve/`** (bundled/minified output). Filtering the lint output for the five
changed source files (`src/types/article.ts`, `src/config/snippets.ts`,
`src/utils/mediumContentGenerator.ts`, `src/components/settings/SettingsMediumSection.vue`,
`src/components/settings/SettingsContent.vue`) returns **no matches** — the changed files lint
cleanly. The `.netlify/` noise is pre-existing and unrelated to this task.

### `npm run type-check`

Passed cleanly:

```
> vue-tsc --build
```

No type errors.

## Checklist

- ✓ **Security — Rule 1 (anchor reaches DOM only via `sanitizeBodyHtml`).** The anchor is
  interpolated into `bodyHtml` in `buildUtmBlock`; `PlatformMedium.vue` renders and copies only
  `sanitizedBodyHtml`. `rawBodyHtml` is `v-model`-bound to a `<textarea>`, never rendered raw.
- ✓ **Security — Rule 2 (no allowlist widening).** `SettingsContent.vue` `saveAll` routes only
  `EN_WHY_BODY_HTML` / `FR_WHY_BODY_HTML` through `sanitizeBodyHtml`; the new anchor keys persist
  verbatim on the plain-text path. `SANITIZE_CONFIG` untouched.
- ✓ **Security — Rule 3 (inert field values).** Both new fields in `SettingsMediumSection.vue`
  bind as `type="text"` inputs; no `v-html` / unescaped preview.
- ✓ **Object Calisthenics.** `getMediumUtmAnchorText` and `buildUtmBlock` use early returns, no
  `else`, one indentation level, ≤5 statements. `defineModel` / composable idioms are the
  sanctioned framework exceptions.
- ✓ **Naming clarity.** `anchorText`, `utmLink`, `enUtmAnchor`, `frUtmAnchor` — no abbreviations
  or single-letter identifiers.
- ✓ **No dead code / unused imports.** `mediumContentGenerator.ts` imports
  `getMediumUtmAnchorText`, `getWhySnippet`, `SNIPPET_DEFAULTS` — all used.
- ✓ **Vue/TS pitfalls.** `defineModel` correct per key; `PlatformMedium.vue` passes the live
  `snippets.value` map; exported functions carry explicit return types; no reactive-destructuring
  loss; no `any` / non-null assertions introduced.
- ✓ **Implementation matches the business spec.** EN default `Let's review this in the full
  article`, FR default `Venez lire l'article complet`, Medium generator selects by blog language,
  two mirrored settings fields, Substack FR default reworded. Source is complete and correct.

## Prior finding F1 — disposition

The previous review raised F1: the pre-existing assertion at
`src/utils/substackContentGenerator.test.ts:94` still expects the old wording `Allez lire
l'article complet`. Per the loop-back decision recorded in `technical-specifications.md`
(2026-07-09), this is a **test-assertion update owned by `/jli-writes-tests`**, not a source
defect — `test-cases.md` already specifies the new wording and the absence of the old one. It
is not a finding against the changed source files listed in the technical spec, so it does not
block this source review. It remains tracked for the tests phase to reconcile.

status: approved
