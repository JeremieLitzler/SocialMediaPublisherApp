# Task-013: Substack Content Generation — Technical Specifications

## Files Created / Modified

| File | Action | Description |
|------|--------|-------------|
| `src/config/snippets.ts` | Modified | Added Substack attribution lines and share block text constants with `getSubstackAttributionLine()` and `getSubstackShareBlockText()` exports |
| `src/utils/substackContentGenerator.ts` | Created | Pure function `generateSubstackContent(article)` that builds `SubstackContent` including assembled `bodyHtml` |
| `src/components/platforms/PlatformSubstack.vue` | Created | Display component with DOMPurify-sanitized live HTML preview linked to an editable textarea, per-field `CopyButton`, HTML clipboard copy with fallback, and Start over button |
| `src/pages/substack.vue` | Created | Route page that delegates to `PlatformSubstack.vue` |

## Technical Choices

### Substack snippets co-located with Medium snippets in `snippets.ts`
The file already existed from Task-012. Substack constants were prepended in a clearly delimited section. Co-location follows the established pattern and keeps all bilingual snippet logic in one place.

### UTM link anchor text is a descriptive phrase, not the raw URL
The anchor text is `I'd like to read the full article` rather than the raw URL. This follows the same intent as Medium's `Read the full article` but uses first-person phrasing that fits the Substack newsletter tone.

### French attribution contains an HTML anchor; attribution logic lives in the generator, not `snippets.ts`
Both attribution lines (`Originally published on <a href="...">iamjeremie.me</a>` and `Originallement publiée sur <a href="...">jeremielitzler.fr</a>.`) require UTM links to the respective blog homepages, which depends on the platform name — knowledge that belongs in the content generator, not in the platform-agnostic `snippets.ts`. `getSubstackAttributionLine` was therefore removed from `snippets.ts`; the generator handles attribution via `buildEnglishAttributionLine()` and `buildFrenchAttributionLine()`, each generating a UTM link to their blog homepage (`ENGLISH_BLOG_URL` / `FRENCH_BLOG_URL`). `snippets.ts` retains only plain-text constants.

### `buildBodyHtml` decomposes into one helper per logical block
Each block (`buildFigureHtml`, `buildUtmBlock`, `buildAttributionBlock`, `buildShareBlock`) is a single-responsibility function of ≤5 lines. The top-level `buildBodyHtml` joins them, maintaining one level of indentation per function (Object Calisthenics rules 1 and 7).

### No `<hr />` separators between blocks
Medium uses `<hr />` between sections because it has heterogeneous content zones (intro / follow-me / why). Substack's body is a single narrative flow: image → intro → link → attribution → share. Horizontal rules would be visually jarring; the spec does not call for them.

### DOMPurify sanitized live HTML preview (mirrors PlatformMedium.vue)
The Body HTML section uses an editable `textarea` (`v-model="rawBodyHtml"`) watched to populate on load, a `DOMPurify.sanitize()` computed for XSS safety, and a `v-html` preview div below the textarea. The Copy button writes the sanitized HTML as a `text/html` blob via the Clipboard API, falling back to `writeText` if the API is unavailable. This is the same pattern as `PlatformMedium.vue` (ADR-007).

status: ready
