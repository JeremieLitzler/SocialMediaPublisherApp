# Security Guidelines — Issue #132: localized Medium read-article anchor

The change adds user-editable plain-text anchor snippets and interpolates the selected one
into the Medium body HTML. Attack surface is limited to stored/self-XSS via those snippet
values; no network, function, secret, or dependency surface is touched.

1. **Treat the new Medium anchor snippets as untrusted plain text.**
   What: values loaded from IndexedDB for the new anchor keys must reach the DOM only through
   the existing render-time sanitisation (`sanitizeBodyHtml` in `src/utils/sanitize.ts`, used
   by `PlatformMedium.vue`); do not add a new raw-render (`v-html`) or unsanitised clipboard
   path for them. Why: a persisted value could carry markup that becomes active content if
   rendered without DOMPurify.

2. **Keep anchor values out of any HTML-allowlist widening.**
   What: in `src/config/snippets.ts` and `useSnippets`, the new keys stay on the plain-text
   snippet path — they must not be added to the bodyHtml sanitise-on-save branch nor cause any
   new tag/attribute to be allowed in `SANITIZE_CONFIG`. Why: anchor text needs no HTML, and
   widening the allowlist for it would expand the XSS surface for all rendered content.

3. **Render anchor values in settings as inert field values only.**
   What: in `SettingsMediumSection.vue` / `SettingsContent.vue`, the two new fields bind the
   values as text-input values, never via `v-html` or an unescaped preview. Why: prevents a
   stored snippet value from executing when the settings page is reopened.

status: ready
