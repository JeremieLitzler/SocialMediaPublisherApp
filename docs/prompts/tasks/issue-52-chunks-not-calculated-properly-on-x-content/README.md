# Issue 52 — Chunks not calculated properly on X content

## User Request

Resolve issue 52: chunks not calculated properly on X content.

## Issue Details

**URL:** https://github.com/JeremieLitzler/SocialMediaPublisherApp/issues/52
**Label:** bug

## Article URL (for reproduction)

https://jeremielitzler.fr/post/2026-03/fonctions-d-ordre-superieur-en-javascript

## Problem

The description (introduction) contains two separate HTML `<p>` paragraphs, but they are being merged into a single chunk instead of being treated as two separate chunks.

## Clarified Requirements

1. Preserve paragraphs: one paragraph = one chunk.
2. If a single paragraph is too long (>280 chars), chunk it at the first ".", "!", or "?" sentence boundary.
3. If a long paragraph cannot be chunked by rule 2 (no sentence boundary found), display a warning to the user:
   - Orange border on the chunk
   - Warning message underneath the chunk (the warning message is NOT to be copied with the chunk content)
