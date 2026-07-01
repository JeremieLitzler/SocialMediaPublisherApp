# Test Cases — Issue #125: Missing-introduction fallback

Plain-language scenarios the implementation must satisfy. Observable behaviour only.

## EMPTY case (has `<h2>`, no introduction before it)

TC-1 — Retain the article on an empty introduction.
Precondition: an article whose content begins with a first `<h2>` and has no introduction before it (e.g. the CSS Variables fixture), with a title, description, image, two categories and two tags.
Action: extract it.
Expected: the extraction result reports a missing introduction, yet the article's title, description, image, categories and tags are retained (not discarded); the introduction is blank.

TC-2 — Stay on home and show the manual-entry fallback.
Precondition: TC-1 has just occurred.
Action: none (observe after extraction).
Expected: the reader remains on the home route; the fallback is shown there conveying that the introduction could not be read but the article was read, inviting the reader to provide one below or add one to the source before the first `<h2>`; an introduction input is present. The reader is not taken to any platform route.

## NO_HEADING case (no `<h2>` at all)

TC-3 — Instruct a source fix, no manual entry.
Precondition: an article whose content has no `<h2>` (e.g. the French no-h2 fixture).
Action: extract it.
Expected: the reader remains on the home route; the fallback instructs the reader to update the source to include at least one `<h2>` preceded by an introduction; no introduction input is offered. The reader is not taken to any platform route.

## Completing the introduction

TC-4 — A supplied introduction opens the chosen platform.
Precondition: TC-2 is showing, and the reader had selected a platform (e.g. LinkedIn) on the input form before extracting.
Action: type at least one visible character of introduction and confirm.
Expected: the retained article is completed with the typed introduction, the result becomes a success, and the reader is taken to the platform they selected (LinkedIn), whose content reflects the typed introduction.

TC-5 — The remembered platform, not a default, is opened.
Precondition: same as TC-4 but the reader selected a different platform (e.g. X).
Action: supply an introduction and confirm.
Expected: the reader is taken to the platform they selected (X), not a fixed/default platform.

TC-6 — A blank introduction cannot proceed.
Precondition: TC-2 is showing.
Action: leave the introduction empty or enter only whitespace, then attempt to confirm.
Expected: confirmation is unavailable; the reader stays on the fallback and is not taken to any platform.

TC-7 — Completing the introduction triggers no re-fetch.
Precondition: TC-2 is showing.
Action: supply an introduction and confirm.
Expected: the platform view is produced from the already-retained article; no second extraction or network request is made.

## Home reset and platform safety net

TC-8 — Returning home starts fresh.
Precondition: a missing-introduction fallback was shown (TC-2 or TC-3).
Action: navigate to the home route again (including via the browser Back button).
Expected: prior missing-introduction state is cleared and the fresh input form is shown — no stale fallback and no stale platform content.

TC-9 — A platform route without an article redirects home.
Precondition: no article is loaded (idle state).
Action: navigate directly to a platform route.
Expected: the reader is redirected to the home route.

## Security

TC-10 — Manual introduction with active HTML is sanitised on preview platforms.
Precondition: TC-2 is showing; the target platform renders an HTML preview (Medium or Substack).
Action: enter an introduction containing active markup (e.g. a `<script>` tag or an `onerror` attribute) and confirm.
Expected: the rendered preview contains no executable/active content — scripts and event-handler attributes are stripped; no script runs.

TC-11 — Manual introduction is shown as literal text on text platforms.
Precondition: TC-2 is showing; the target platform renders the body as text (X or LinkedIn).
Action: enter an introduction containing angle-bracket markup and confirm.
Expected: the markup appears as literal characters in the body, not interpreted as HTML.

TC-12 — Over-long manual introduction is bounded.
Precondition: TC-2 is showing.
Action: enter an introduction longer than the accepted maximum.
Expected: the introduction that reaches the platform content is limited to the maximum length; the app remains responsive.

## Regression

TC-13 — A normal article still works.
Precondition: an article with a proper introduction before its first `<h2>`, with a selected platform.
Action: extract it.
Expected: extraction succeeds and the reader is taken to the selected platform, whose content includes the extracted introduction — the missing-introduction fallback is never shown.

status: ready
