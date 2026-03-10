# ADR-007: HTML Sanitization Strategy for v-html Rendering

**Date:** 2026-03-03
**Status:** Accepted
**Implemented:** 2026-03-09

## Context

The Medium page (`PlatformMedium.vue`) renders a live preview of the generated `bodyHtml`
using Vue's `v-html` directive. The content is initially machine-generated (safe), but the
user can edit it in the textarea before copying. Any content fed to `v-html` that contains
`<script>`, event handlers (`onerror`, `onclick`, …), or other active HTML is executed
directly in the browser, creating an XSS risk.

Vue's official documentation explicitly warns: _"Dynamically rendering arbitrary HTML on
your website is very dangerous because it can easily lead to XSS vulnerabilities. Only use
`v-html` on trusted content and never on user-provided content."_

Since the textarea is user-editable, the rendered preview must be sanitized before binding
to `v-html`.

## Decision

Use **DOMPurify** (`dompurify` npm package) to sanitize HTML before binding it to `v-html`.

DOMPurify is run inside a `computed` property:

```ts
import DOMPurify from 'dompurify'

const sanitizedBodyHtml = computed(() => DOMPurify.sanitize(rawBodyHtml.value))
```

The default DOMPurify configuration strips all active content (`<script>`, inline event
handlers, `javascript:` URLs, `<iframe>`, `<object>`, etc.) while preserving all HTML
structure and styling used in the bodyHtml template (`<figure>`, `<img>`, `<p>`, `<ul>`,
`<li>`, `<h2>`, `<a>`, `<hr>`, `<figcaption>`, `<br>`, `<pre>`, `<blockquote>`, `<span>`).

The Copy button for Body HTML uses the **Clipboard API** (`navigator.clipboard.write`) with
a `ClipboardItem` of type `text/html`, so that pasting into a rich-text editor (such as
Medium's) preserves the rendered structure. A `text/plain` fallback is provided for
environments where `ClipboardItem` is unavailable.

## Consequences

### Positive

- Eliminates XSS risk from user-edited HTML rendered via `v-html`
- DOMPurify is purpose-built, battle-tested, and actively maintained
- Default configuration requires no custom allowlist — all safe tags used in bodyHtml are
  preserved automatically, including `<pre>`, `<blockquote>`, and `<span>` added in issue #75
- The `text/html` clipboard format allows pasting formatted content directly into Medium's
  visual editor without manual reformatting

### Negative

- Adds a runtime dependency (`dompurify` + `@types/dompurify`)
- DOMPurify relies on a live DOM, so it cannot be used in SSR (not applicable here — the
  app is a pure client-side SPA deployed on Netlify)

## Alternatives Considered

- **No sanitization**: Acceptable only if the textarea were read-only. Since it is editable,
  this is rejected.
- **Custom allowlist regex**: Fragile and historically error-prone. DOMPurify is maintained
  by browser security specialists; a hand-rolled approach would not be.
- **`<iframe sandbox>`**: Isolates rendering but makes clipboard access significantly more
  complex and prevents styling inheritance. Rejected for this use case.
- **Trusted Types API**: Complementary browser-level defence, not a replacement for
  sanitization. Could be added later as a defence-in-depth measure.

## Notes

- Applies to `PlatformMedium.vue` and `PlatformSubstack.vue`, both of which render `bodyHtml`
  via `v-html` using the same DOMPurify computed property pattern.
- If `v-html` is introduced in other components in the future, the same DOMPurify pattern
  must be applied.
