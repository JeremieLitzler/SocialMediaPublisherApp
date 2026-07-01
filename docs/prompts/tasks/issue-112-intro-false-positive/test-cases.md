# Test Cases — Issue #112: Intro "false positive" messaging

Plain-language scenarios the implementation must satisfy. Observable behaviour only.

## Missing-introduction outcome (no `<h2>` in article content)

### TC-1 — Article whose section headings are `<h3>` enters the missing-introduction state

- Precondition: the fetched article has an `.article-content` region containing
  introduction paragraphs, but its first (and only) section headings are `<h3>`, with no
  `<h2>` anywhere inside `.article-content` (the saved `example-ko.html` case).
- Action: the user submits that article's URL for extraction.
- Expected: extraction does not succeed; the app enters the `missing-introduction` state
  and the manual-introduction fallback becomes visible. No platform content is produced.

### TC-2 — The message names the true cause

- Precondition: the app is in the `missing-introduction` state from TC-1.
- Action: the user reads the message shown in the fallback.
- Expected: the message explains that the source article has no `<h2>` section heading, so
  the end of the introduction cannot be located, and directs the author to fix the article
  to use `<h2>` for its section headings. The message must NOT claim the article has no
  paragraphs / no introduction content.

### TC-3 — Missing article-content container yields the same state and an accurate message

- Precondition: the fetched page has no `.article-content` region (page is not a
  recognized article).
- Action: the user submits that URL for extraction.
- Expected: the app enters the `missing-introduction` state; the message is accurate for an
  unrecognized article structure (does not falsely assert missing paragraphs).

## Manual fallback still works

### TC-4 — Manual entry lets the user proceed

- Precondition: the app is in the `missing-introduction` state (TC-1).
- Action: the user types an introduction into the manual field and confirms to continue.
- Expected: the app leaves the fallback and reaches the success state using the
  user-entered introduction; the manual-entry option is presented as the immediate
  workaround alongside the corrected message.

## Regressions (behaviour must be unchanged)

### TC-5 — Article with a proper `<h2>` after intro paragraphs still succeeds

- Precondition: the fetched article has introduction paragraphs followed by a first `<h2>`
  section heading inside `.article-content`.
- Action: the user submits that article's URL for extraction.
- Expected: extraction succeeds; the introduction is the qualifying elements before the
  first `<h2>`, in source order; the `missing-introduction` state is not entered.

### TC-6 — Article with a first `<h2>` and no preceding intro elements is unchanged

- Precondition: the fetched article's `.article-content` begins with an `<h2>`, with no
  qualifying introduction elements before it.
- Action: the user submits that article's URL for extraction.
- Expected: the outcome is identical to the pre-change behaviour for this shape; the
  messaging change does not alter which state is reached.

status: ready
