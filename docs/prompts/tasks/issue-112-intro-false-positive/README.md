Worktree: /e/Git/GitHub/SocialMediaPublisherApp_fix-intro-false-positive

# Issue #112 — Error with article not having an intro but actually does

**URL:** https://github.com/JeremieLitzler/SocialMediaPublisherApp/issues/112
**Type:** fix
**Branch:** fix/intro-false-positive

## Feature request (issue body)

This article has an intro but app detects it doesn't:

> `https://jeremielitzler.fr/post/2025-10/composition-vs-aggregation-vs-association/`

## Notes

The `missing-introduction` status is a false positive for the article above. The
introduction extraction (all `<p>`, `<pre>`, `<ul>`, `<ol>`, `<blockquote>` tags before
the first `<h2>` in `.article-content`) fails to detect content that is actually present.
Investigate why the extraction returns empty for this article and fix the detection.
