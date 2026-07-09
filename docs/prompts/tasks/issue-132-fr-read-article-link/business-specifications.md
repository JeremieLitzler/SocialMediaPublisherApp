# Business Specifications — Issue #132: French articles get an English "read the full article" link on Medium

## Goal and scope

Medium cross-post generation currently emits a fixed English anchor ("Read the full
article") for the link back to the source article, regardless of the article's language.
For French articles this produces an English link inside otherwise French content.

Scope: localize the Medium "read the full article" anchor by the article's blog language,
using the same user-editable snippet mechanism already used for the Substack anchor (see
`SNIPPET_DEFAULTS` and the Substack anchor getters in `src/config/snippets.ts`). No change
to X, LinkedIn, or Substack output. Only the Medium anchor text is affected; the link URL,
UTM tagging, separators, and surrounding blocks stay identical.

## Rules

1. When the article's blog is French, the Medium anchor text reads "Venez lire l'article
   complet". When it is English, it reads "Let's review this in the full article" (aligning
   the English wording with the Substack anchor). Only the visible link text changes.

2. The anchor text for each language is a user-editable snippet with a hardcoded default,
   persisted and reset through the existing snippet mechanism — no separate storage or reset
   path. A saved custom value overrides the default; a reset restores the two defaults above.

3. The Medium settings section exposes two new editable fields, one per language, labelled as
   the Medium UTM link anchor text — mirroring the Substack section's anchor fields. Saving,
   per-key persistence, and reset-to-defaults behave exactly as for existing snippets.

4. Generated Medium content remains valid, paste-ready HTML: the localized text sits inside
   the same anchor element, link, and visual-separator paragraph as before. Example: for the
   issue's French article the link becomes `<a href="…utm_source=Medium">Allez lire l'article
complet</a>` with an unchanged href.

## Files to create or modify

- `src/types/article.ts` — extend the set of editable snippet keys to include the two new
  Medium anchor keys (English and French).
- `src/config/snippets.ts` — add the two default anchor strings and a language-selecting
  accessor for the Medium anchor, parallel to the existing Substack anchor accessor.
- `src/utils/mediumContentGenerator.ts` — build the anchor text from the selected snippet by
  blog language instead of the hardcoded English string; accept the live snippet map as the
  Substack generator already does.
- `src/components/settings/SettingsMediumSection.vue` — add the two anchor input fields.
- `src/components/settings/SettingsContent.vue` — bind the two new fields to the settings
  state alongside the existing Medium fields.
- Co-located `*.spec.ts` test files for the changed generator, config, and settings —
  cover French vs English default text, a custom saved override, and reset-to-default, per
  the 100% utils/composable coverage target in CLAUDE.md.

## Constraints

- Behaviour is deterministic and offline: language selection derives solely from the already
  extracted blog value; no network or locale detection is introduced.
- Existing snippet security handling is unchanged; these anchor values are plain text (not
  bodyHtml), so they follow the same plain-text snippet path as the Substack anchor.

status: ready
