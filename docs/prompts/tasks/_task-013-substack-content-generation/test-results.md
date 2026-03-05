# Task-013: Substack Content Generation — Test Results

## Test files introduced

- `src/utils/substackContentGenerator.test.ts` — 19 unit tests for the content generator pure function
- `src/components/platforms/PlatformSubstack.test.ts` — 15 component tests for the display component

## substackContentGenerator tests (19)

| Test | Result |
|------|--------|
| maps title directly from article | ✓ |
| maps description directly from article | ✓ |
| maps category directly from article | ✓ |
| passes tags array through unchanged | ✓ |
| bodyHtml contains img tag with correct src | ✓ |
| bodyHtml contains img tag with correct alt | ✓ |
| bodyHtml omits figcaption when imageCreditSnippet is null | ✓ |
| bodyHtml contains figcaption when imageCreditSnippet is present | ✓ |
| bodyHtml contains introduction HTML verbatim | ✓ |
| bodyHtml UTM link has utm_source=Substack | ✓ |
| bodyHtml UTM link has utm_medium=social | ✓ |
| bodyHtml UTM link anchor text is the descriptive phrase | ✓ |
| bodyHtml contains EN attribution for English article | ✓ |
| bodyHtml English attribution links to iamjeremie.me with UTM params | ✓ |
| bodyHtml attribution line is wrapped in em tags | ✓ |
| bodyHtml contains EN share text for English article | ✓ |
| bodyHtml contains FR attribution for French article | ✓ |
| bodyHtml French attribution links to jeremielitzler.fr with UTM params | ✓ |
| bodyHtml contains FR share text for French article | ✓ |

### Fix applied during test run

Tests for the attribution UTM href initially used `&amp;` (HTML-encoded) instead of `&` (raw string). The `bodyHtml` field is a raw string — HTML encoding only occurs in a DOM context. The assertions were corrected to match `&` and the trailing slash that the URL API appends to bare domain URLs (e.g. `https://iamjeremie.me/`).

## PlatformSubstack component tests (15)

| Test | Result |
|------|--------|
| shows fallback message when no article is loaded | ✓ |
| shows a link home when no article is loaded | ✓ |
| does not show content block when no article | ✓ |
| shows Substack heading when article is loaded | ✓ |
| calls generateSubstackContent with the article | ✓ |
| displays the actual title value as text | ✓ |
| displays the actual description value as text | ✓ |
| displays the actual category value as text | ✓ |
| renders the bodyHtml in a textarea | ✓ |
| renders a live HTML preview below the textarea | ✓ |
| preview contains sanitized rendered HTML from the textarea | ✓ |
| preview strips script tags from user input | ✓ |
| renders CopyButton elements when article is loaded | ✓ |
| renders one CopyButton per tag | ✓ |
| calls resetState and navigates home when Start over is clicked | ✓ |

## Full suite

```
Test Files  14 passed (14)
     Tests  238 passed (238)
  Duration  8.25s
```

### Test Summary

All 238 tests pass across 14 test files. The 34 new Substack tests cover all acceptance criteria from the task README: content field mapping, bodyHtml structure (figure, figcaption, introduction, UTM block, attribution anchors, share block), bilingual attribution and share text, DOMPurify XSS sanitization, no-article fallback, and Start over navigation.

status: passed
