# Security Guidelines — Extract Constants to Parameters (Issue #47)

1. **Validate and sanitise all user-supplied snippet values before persisting them to IndexedDB.**
   Where: `src/composables/useSnippets.ts` (save operation).
   Why: Stored values are later injected into generated HTML (Medium bodyHtml via `v-html`); unsanitised input creates a stored XSS vector.

2. **Sanitise Medium bodyHtml snippet values before any `v-html` binding, using `sanitizeBodyHtml` from `src/utils/sanitize.ts`.**
   Where: Any component that binds Medium bodyHtml to `v-html` (per ADR-007).
   Why: If a user pastes malicious HTML into the bodyHtml textarea on the settings page, it must be stripped before rendering.

3. **Do not expose or log raw IndexedDB values in error messages visible to third parties.**
   Where: `src/composables/useIndexedDb.ts` (error handlers).
   Why: Error details must not leak snippet content in environments with shared browser DevTools access.

4. **Treat the IndexedDB store as untrusted on read — apply the same type-narrowing and validation on retrieved values as on user input.**
   Where: `src/composables/useSnippets.ts` (load operation).
   Why: An IndexedDB entry could have been written by a compromised browser extension or a previous buggy version; silently coercing an unexpected shape to a string prevents prototype pollution or injection.

5. **The settings page must not accept or display values from URL query parameters or route params.**
   Where: `src/pages/settings.vue`.
   Why: Populating form fields from URL inputs is a reflected XSS vector; all initial values must come from IndexedDB or hardcoded defaults only.

status: ready
