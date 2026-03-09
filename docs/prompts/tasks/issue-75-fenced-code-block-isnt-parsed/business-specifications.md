# Business Specifications — Issue #75: Fenced Code Block Isn't Parsed

## Goal and Scope

When a blog article introduction contains rich content elements — fenced code blocks (`<pre>`), bullet lists (`<ul>`), or blockquotes (`<blockquote>`) — the introduction extraction step currently ignores them. Only `<p>` elements are collected. These elements are silently dropped, causing the generated Medium and Substack content to be incomplete and potentially misleading.

The goal of this change is to make the introduction extraction faithful to the source article: any `<pre>`, `<ul>`, or `<blockquote>` element appearing in the introduction area (before the first `<h2>` in `.article-content`) must be preserved alongside `<p>` elements and carried through to the Medium and Substack outputs.

X and LinkedIn are not affected. Those platforms receive plain text adapted manually by the user, so no change to their content generation is in scope.

## Affected Files

### `src/utils/htmlExtractor.ts`

This file contains the `extractIntroduction` pure function responsible for collecting introduction content. It is the single source of the defect: it walks the DOM children of `.article-content` before the first `<h2>` but only retains `<p>` elements. It must be updated so that `<pre>`, `<ul>`, and `<blockquote>` elements are also retained during that walk.

No other extractor functions are affected.

### `docs/specs/01-requirements.md`

FR-2 currently documents the extraction rule as "all `<p>` tags before first `<h2>`". This document must be updated to reflect the expanded rule: all `<p>`, `<pre>`, `<ul>`, and `<blockquote>` elements before the first `<h2>`.

### Test file for `htmlExtractor.ts`

The existing unit-test suite for `htmlExtractor.ts` must be extended to cover the new behaviour. No new test file is needed; the existing test file is the correct place.

## Rules and Constraints

1. Only elements that appear before the first `<h2>` within `.article-content` are part of the introduction. A `<pre>`, `<ul>`, or `<blockquote>` that appears after the first `<h2>` is body content, not introduction content, and must not be included.
2. The relative order of all retained elements (`<p>`, `<pre>`, `<ul>`, `<blockquote>`) as they appear in the source HTML must be preserved in the extracted introduction HTML.
3. No other element types (e.g. `<div>`, `<table>`, `<ol>`) are added to the introduction by this change.
4. The extraction result is an HTML string. Each retained element must be represented with its full HTML markup, identical to its source, just as `<p>` elements are today.
5. If the introduction contains only non-`<p>` elements (e.g. only a `<pre>`) and no `<p>` elements, extraction must still succeed and return the content rather than an empty string.
6. If the introduction contains none of the retained element types (but a `<h2>` is present), the existing behaviour is preserved: an empty string is returned, which results in the `missing-introduction` state and the manual-input fallback.
7. The existing `null` return condition — no `<h2>` present — remains unchanged.

## Example Mapping

### Rule: `<pre>`, `<ul>`, and `<blockquote>` elements in the introduction are extracted

**Example 1 — Introduction with only paragraphs (existing behaviour unchanged)**
Given an article whose introduction area contains three `<p>` elements and no other retained elements,
when the introduction is extracted,
then the result contains all three paragraphs.

**Example 2 — Introduction with only a code block**
Given an article whose introduction area contains one `<pre>` element and no `<p>` elements,
when the introduction is extracted,
then the result contains the `<pre>` element's full HTML.

**Example 3 — Introduction with mixed paragraphs and code block**
Given an article whose introduction area contains a `<p>`, then a `<pre>`, then another `<p>` (in that order),
when the introduction is extracted,
then the result contains all three elements in their original order.

**Example 4 — Introduction with a bullet list**
Given an article whose introduction area contains a `<p>` followed by a `<ul>` element,
when the introduction is extracted,
then the result contains both the `<p>` and the `<ul>` in their original order.

**Example 5 — Introduction with a blockquote**
Given an article whose introduction area contains a `<blockquote>` element,
when the introduction is extracted,
then the result contains the `<blockquote>` element's full HTML.

**Example 6 — Element after the first `<h2>` is excluded**
Given an article whose introduction area contains one `<p>` before the first `<h2>`, and a `<pre>` that appears after the first `<h2>`,
when the introduction is extracted,
then the result contains only the `<p>` and does not include the `<pre>`.

**Example 7 — Medium output includes all retained element types**
Given an article whose extracted introduction contains `<pre>`, `<ul>`, and `<blockquote>` elements,
when Medium content is generated,
then the HTML body section for the introduction renders all of them, preserving their content and structure.

**Example 8 — Substack output includes all retained element types**
Given an article whose extracted introduction contains `<pre>`, `<ul>`, and `<blockquote>` elements,
when Substack content is generated,
then the HTML body section for the introduction renders all of them, preserving their content and structure.

**Example 9 — X and LinkedIn are unaffected**
Given any article, regardless of whether its introduction contains `<pre>`, `<ul>`, or `<blockquote>` elements,
the content presented for X and LinkedIn is unchanged by this fix.

## Edge Cases (Observable Consequences)

- A `<pre>` element that is empty (no text content) is included verbatim in the extraction result; it is not silently dropped.
- A `<pre>` element that contains nested HTML (e.g. syntax-highlighted `<span>` elements) is preserved as-is, without any alteration to its inner content.
- A `<ul>` element containing nested `<li>` elements is preserved with its full inner HTML.
- A `<blockquote>` containing nested `<p>` elements is preserved with its full inner HTML.
- An introduction that consists solely of non-`<p>` retained elements does not trigger the `missing-introduction` state; the extraction is considered successful.
- An article with no `<h2>` returns `null` from extraction regardless of which element types are present. The `missing-introduction` fallback UI is shown.

## Concurrency and Performance

This change is a pure DOM traversal with no I/O or async operations. The extraction must complete synchronously within the existing extraction pipeline. No observable change in end-to-end extraction time is expected or acceptable; the fix must not introduce any asynchronous processing.

status: ready
