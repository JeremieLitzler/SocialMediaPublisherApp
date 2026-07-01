# Security Guidelines — Issue #125: Missing-introduction fallback

The only new attack surface is the **manually typed introduction**: previously the introduction came from whitelisted blog HTML; now it can be arbitrary text entered by the user and merged into the retained article, then fed into generated platform content. The rules below constrain that flow. Areas untouched by this change (Netlify Function boundary, domain allowlist, `DOMParser`, secrets, dependencies) are out of scope.

1. **What:** The manually typed introduction must reach any `v-html` binding only through the existing DOMPurify sanitizer. **Where:** the introduction-to-`bodyHtml` flow feeding `PlatformMedium.vue` / `PlatformSubstack.vue` (see ADR-007). **Why:** the manual intro is fully user-controlled and could carry `<script>` or event-handler attributes, so bypassing the sanitizer would open an XSS hole.

2. **What:** On the platforms that render the body as text (X, LinkedIn `<pre>` blocks), the manual introduction must be rendered via Vue text interpolation (auto-escaped), never via `v-html`. **Where:** the X and LinkedIn platform content rendering. **Why:** these views have no DOMPurify pass, so any raw-HTML rendering of the intro would inject active markup.

3. **What:** Bound the accepted introduction to a reasonable maximum length before it enters shared state or content generation. **Where:** the manual-introduction input handling in `ManualIntroduction.vue`. **Why:** an unbounded paste can degrade rendering and clipboard operations, a client-side denial-of-service on the SPA.

status: ready
