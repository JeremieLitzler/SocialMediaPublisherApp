# Technical Specifications — Issue #132: localized Medium read-article anchor

## Files changed

- `src/types/article.ts` — added `EN_MEDIUM_UTM_ANCHOR` and `FR_MEDIUM_UTM_ANCHOR` to the
  `SnippetKey` union.
- `src/config/snippets.ts` — added the two Medium anchor defaults, added
  `getMediumUtmAnchorText(blog, snippets)` accessor, and reworded the French Substack anchor
  default to `Venez lire l'article complet`.
- `src/utils/mediumContentGenerator.ts` — `buildUtmBlock` now selects the anchor text by blog
  language from the live snippet map instead of the hardcoded English string.
- `src/components/settings/SettingsMediumSection.vue` — added the EN and FR Medium UTM anchor
  text inputs (one per language group).
- `src/components/settings/SettingsContent.vue` — bound the two new anchor fields to
  `local` settings state.

## Decisions and rationale

- **Mirror the Substack accessor rather than generalise.** `getMediumUtmAnchorText` is a
  direct parallel of `getSubstackUtmAnchorText` (same signature, same default-fallback
  behaviour). A shared generic helper would couple two independently-editable snippet sets;
  keeping them parallel matches the existing codebase shape and keeps each generator readable.

- **No changes to `useSnippets`, load/save, or reset paths.** All keys are derived from
  `Object.keys(SNIPPET_DEFAULTS)`, so adding the two keys to `SnippetKey` and
  `SNIPPET_DEFAULTS` makes persistence, per-key save, and reset-to-defaults cover them with
  no further wiring. This is why TC-5–TC-8 are satisfied without composable edits.

- **English default aligned with Substack.** Per Rule 1 the English Medium anchor default is
  `Let's review this in the full article` (not the former `Read the full article`), so both
  platforms share the same English wording default. The hardcoded English string was removed
  from the generator entirely, satisfying TC-2's "does not contain `Read the full article`".

- **Anchor fields placed first in each language group in settings.** Groups the UTM anchor
  above the longer "Why" fields; ordering is cosmetic and the spec only requires the two
  fields to exist and mirror the Substack section.

## Security compliance

- Anchor snippets stay on the plain-text path: `SettingsContent.vue` only routes
  `EN_WHY_BODY_HTML` / `FR_WHY_BODY_HTML` through `sanitizeBodyHtml` on save; the new anchor
  keys are persisted verbatim as plain text (Rule 2 — no allowlist widening).
- At render time the anchor is interpolated into the Medium `bodyHtml`, which
  `PlatformMedium.vue` renders only through `sanitizeBodyHtml` (Rule 1 — no new raw-render or
  unsanitised clipboard path).
- Settings fields bind the values as `type="text"` input values, never via `v-html` (Rule 3).

## Object Calisthenics notes

- `buildUtmBlock` takes three parameters (url, blog, snippets) mirroring the Substack
  generator; body is 3 statements, within the ≤5-line method guideline.
- Vue `defineModel` / composable conventions are framework idioms and are used as the sanctioned
  exceptions to the getter/setter and primitive-wrapping rules.

## Review loop-back — F1 disposition (2026-07-09)

`review-results.md` raised one finding (F1): the pre-existing assertion at
`src/utils/substackContentGenerator.test.ts:94` still expects the old French wording
`Allez lire l'article complet`, which this task reworded to `Venez lire l'article complet`.

- **No production source change is required** — the reviewer confirmed the implementation
  (types, config defaults, generator, settings components) is complete and correct. F1 is
  purely a test-assertion update.
- **Deferred to `/jli-writes-tests`** (user decision, 2026-07-09). `/jli-codes` does not author
  or edit test files (`.spec.ts` / `.test.ts`), and `test-cases.md` already specifies the new
  wording and the absence of the old wording (see TC referencing `Venez lire l'article complet`
  / `Allez lire l'article complet`), so the tests phase owns reconciling this assertion. No
  files were modified in this loop-back pass.

status: ready
