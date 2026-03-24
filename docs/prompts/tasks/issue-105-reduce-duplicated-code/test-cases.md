# Test Cases — Issue #105: Reduce Duplicated Code

## Shared Figure HTML Builder (`articleHtmlBuilder.ts`)

### TC-01: buildFigureHtml returns figure with img and no caption when imageCreditSnippet is null

- Given: an article with a non-empty imageUrl, a non-empty imageAlt, and imageCreditSnippet = null
- When: buildFigureHtml is called
- Expected: returns a `<figure>` element containing only an `<img>` tag with the correct src and alt attributes; no `<figcaption>` present

### TC-02: buildFigureHtml returns figure with img and figcaption when imageCreditSnippet is provided

- Given: an article with imageUrl, imageAlt, and a non-null imageCreditSnippet HTML string (e.g. `<p>Photo by Alice</p>`)
- When: buildFigureHtml is called
- Expected: returns a `<figure>` containing an `<img>` and a `<figcaption>` whose text content equals the plain-text version of the imageCreditSnippet

### TC-03: VISUAL_SEPARATOR constant is the correct emoji string

- Given: the VISUAL_SEPARATOR exported from the shared module
- Expected: its value is `'⬇️⬇️⬇️'`

## Shared Paragraph Extraction

### TC-04: extractParagraphTexts returns trimmed non-empty paragraph strings

- Given: an HTML string containing two `<p>` elements with leading/trailing whitespace and one empty `<p>`
- When: extractParagraphTexts is called
- Expected: returns an array of two trimmed strings, the empty paragraph excluded

### TC-05: extractParagraphTexts collapses internal whitespace

- Given: an HTML string with a `<p>` element whose text content contains multiple consecutive spaces
- When: extractParagraphTexts is called
- Expected: returns an array with one string where consecutive spaces are collapsed to a single space

### TC-06: extractParagraphTexts returns an empty array for HTML with no p elements

- Given: an HTML string with no `<p>` elements (e.g. only `<div>` content)
- When: extractParagraphTexts is called
- Expected: returns an empty array

## Regression: Medium Content Generator

### TC-07: generateMediumContent output is unchanged after refactor

- Given: a fully populated article object (with imageUrl, imageAlt, imageCreditSnippet, introduction, followMeSnippet, url, blog, title, description, category, tags) and default snippets
- When: generateMediumContent is called
- Expected: the returned MediumContent object matches the output that was produced before the refactor (same bodyHtml, same all fields)

## Regression: Substack Content Generator

### TC-08: generateSubstackContent output is unchanged after refactor

- Given: a fully populated article object and default snippets
- When: generateSubstackContent is called
- Expected: the returned SubstackContent object matches the output produced before the refactor

## Regression: LinkedIn Content Generator

### TC-09: generateLinkedInContent body contains VISUAL_SEPARATOR from shared constant

- Given: an article with a known introduction HTML
- When: generateLinkedInContent is called
- Expected: the body string contains `⬇️⬇️⬇️`

## Regression: X Content Generator

### TC-10: generateXContent chunk texts are unchanged after paragraph extraction refactor

- Given: an article with a known introduction containing two paragraphs
- When: generateXContent is called
- Expected: chunks are produced with the same text as before the refactor

status: ready
