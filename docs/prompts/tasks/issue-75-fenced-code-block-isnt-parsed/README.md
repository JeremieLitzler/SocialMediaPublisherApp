# Issue #75 — Fenced code block isn't parsed

## Problem

When a blog article introduction contains a fenced code block (rendered as `<pre>...</pre>` in HTML), the current extraction logic in `extractIntroduction` only collects `<p>` tags and silently drops `<pre>` elements. As a result, code blocks in the introduction are missing from the generated Medium and Substack content.

## Expected Behavior

- The Medium and Substack content generators should include `<pre>` blocks that appear in the article introduction alongside `<p>` paragraphs.
- For X and LinkedIn, no change is needed — the user adapts content manually.

## Article Example

https://iamjeremie.me/post/2026-03/organizing-specifications-with-claude-code/

The introduction of this article contains a fenced code block that is transformed into `<pre>...</pre>` in HTML.

## Fix

`extractIntroduction` in `src/utils/htmlExtractor.ts` should also include `<pre>` elements (not just `<p>` elements) when building the introduction HTML.
