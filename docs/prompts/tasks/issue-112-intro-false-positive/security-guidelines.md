# Security Guidelines — Issue #112: Intro "false positive" messaging + empty-intro detection

Small attack surface: the feature changes static fallback messages and the branching that
decides `missing-introduction`. HTML fetching stays behind the Netlify Function domain
allowlist (see ADR-006) and is unchanged here.

1. **Keep every fallback message a fixed, hard-coded string.** *Where:*
   `src/composables/useArticleExtractor.ts` (the text carried into `missing-introduction`) and
   `src/components/article/ManualIntroduction.vue`. *Why:* interpolating the fetched HTML,
   the submitted URL, or any article-derived text into the message would let an attacker-
   controlled page inject markup/script into our UI (reflected XSS).

2. **Render the message and surrounding copy via text interpolation, never `v-html`.**
   *Where:* `src/components/article/ManualIntroduction.vue`. *Why:* text binding escapes the
   literal `<h2>` (and anything else) so it displays as characters instead of being parsed as
   HTML.

3. **Keep introduction extraction on the inert `DOMParser` path; do not detect the empty-
   introduction case by assigning fetched HTML to a live DOM (`innerHTML`) or by regex-
   executing it.** *Where:* `src/utils/htmlExtractor.ts`. *Why:* `DOMParser` builds an inert
   tree that never runs scripts or loads sub-resources from the untrusted blog HTML.

status: ready
