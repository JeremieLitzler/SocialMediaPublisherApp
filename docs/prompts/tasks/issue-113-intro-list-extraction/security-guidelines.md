# Security Guidelines — Issue #113: Introduction list extraction

The feature transforms already-fetched, already-parsed introduction HTML into **plain-text**
blocks for LinkedIn and X. Attack surface is small: no Netlify Function changes, no new
dependencies, no environment variables, no CORS/header changes. The rules below cover only
what this change touches.

1. **Build blocks from DOM text content, never from raw HTML strings.**
   - *Where:* `src/utils/articleHtmlBuilder.ts` (block extraction).
   - *Why:* the introduction comes from remotely fetched, untrusted article HTML; reading
     element text rather than concatenating markup stops active/unescaped HTML from
     propagating into output or any downstream consumer.

2. **Keep LinkedIn and X output as plain text — do not introduce a `v-html`/`innerHTML` sink.**
   - *Where:* `src/utils/linkedInContentGenerator.ts`, `src/utils/xContentGenerator.ts`, and
     their consuming components.
   - *Why:* these platforms render text, not HTML; adding an HTML rendering path would create
     a new XSS sink outside the sanitization boundary defined in ADR-007.

3. **Bound whitespace/code-block processing against catastrophic regex backtracking (ReDoS).**
   - *Where:* `src/utils/articleHtmlBuilder.ts` (code-block whitespace preservation and any
     line-splitting logic).
   - *Why:* introduction content is attacker-influenceable and unbounded in length; a
     backtracking regex over it can hang the client tab.

status: ready
