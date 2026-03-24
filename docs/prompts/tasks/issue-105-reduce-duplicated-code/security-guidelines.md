# Security Guidelines — Issue #105: Reduce Duplicated Code

This refactor moves existing code between modules. It introduces no new inputs, no new network calls, no new DOM mutations, and no new dependencies. The attack surface is unchanged.

## Rules

1. **No new HTML injection surfaces** — Where in `src/utils/articleHtmlBuilder.ts`. The shared `buildFigureHtml` function constructs HTML strings by interpolating `article.imageUrl` and `article.imageAlt` directly into an `<img>` tag. Ensure these fields are not exposed as raw HTML in any new rendering path. The risk is XSS if untrusted content reaches `v-html`. ADR-007 already governs this; the refactor must not create a new rendering path that bypasses the sanitisation strategy defined there.

2. **No implicit expansion of the shared utility's input surface** — The new shared utilities must accept only the types already defined in `src/types/article.ts`. Do not broaden parameter types to accept raw strings from unvalidated sources.

3. **Preserve the DOMParser isolation** — The paragraph-extraction function uses DOMParser, which is a safe, sandboxed HTML parser. The refactored shared version must continue to use DOMParser (not `innerHTML` assignment to a live DOM node) to prevent any risk of executing scripts embedded in fetched HTML.

status: ready
