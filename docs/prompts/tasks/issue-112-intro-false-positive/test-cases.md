# Test Cases — Issue #112: Intro messaging + empty-introduction detection

Plain-language scenarios the implementation must satisfy. Observable behaviour only.

## Cause A — no `<h2>` inside article content

### TC-1 — Article whose section headings are `<h3>` enters the missing-introduction state

- Precondition: the fetched article has an `.article-content` region containing introduction
  paragraphs, but its section headings are `<h3>`, with no `<h2>` anywhere inside
  `.article-content` (the `french-no-h2.html` case).
- Action: the user submits that article's URL for extraction.
- Expected: extraction does not succeed; the app enters the `missing-introduction` state and
  the manual-introduction fallback becomes visible. No platform content is produced.

### TC-2 — The no-`<h2>` message names that cause

- Precondition: the app is in the `missing-introduction` state from TC-1.
- Action: the user reads the message shown in the fallback.
- Expected: the message explains the source article has no `<h2>` section heading, so the end
  of the introduction cannot be located, and directs the author to use `<h2>` for its section
  headings. The message must NOT claim the article has no paragraphs / no introduction content.

### TC-3 — Missing article-content container yields the same state and the no-`<h2>` message

- Precondition: the fetched page has no `.article-content` region (page is not a recognized
  article).
- Action: the user submits that URL for extraction.
- Expected: the app enters the `missing-introduction` state; the message is accurate for an
  unrecognized article structure (does not falsely assert missing paragraphs) and matches the
  no-`<h2>` cause message — no separate flow.

## Cause B — a first `<h2>` exists but no introduction content precedes it

### TC-4 — Article with a first `<h2>` and nothing before it enters the missing-introduction state

- Precondition: the fetched article has an `.article-content` region whose first element is an
  `<h2>` (or whose only elements before the first `<h2>` are non-introduction elements), so
  there is no qualifying introduction content before that first `<h2>` (the `english-no-intro.html`
  case).
- Action: the user submits that article's URL for extraction.
- Expected: extraction does not succeed; the app enters the `missing-introduction` state and
  the manual-introduction fallback becomes visible. No platform content is produced. (This
  previously succeeded with an empty introduction.)

### TC-5 — The empty-introduction message names its own cause and differs from the no-`<h2>` message

- Precondition: the app is in the `missing-introduction` state from TC-4.
- Action: the user reads the message shown in the fallback.
- Expected: the message explains the article has no introduction content before its first
  section heading and invites the user to add one to the source article or enter it manually.
  This message is distinct from the no-`<h2>` message of TC-2.

## Manual fallback works for both causes

### TC-6 — Manual entry lets the user proceed

- Precondition: the app is in the `missing-introduction` state (from either TC-1 or TC-4).
- Action: the user types an introduction into the manual field and confirms to continue.
- Expected: the app leaves the fallback and reaches the success state using the user-entered
  introduction; the manual-entry option is presented as the immediate workaround alongside the
  message shown.

## Regression — behaviour must be unchanged

### TC-7 — Article with intro paragraphs before a first `<h2>` still succeeds

- Precondition: the fetched article has one or more qualifying introduction elements followed
  by a first `<h2>` section heading inside `.article-content`.
- Action: the user submits that article's URL for extraction.
- Expected: extraction succeeds; the introduction is the qualifying elements before the first
  `<h2>`, in source order; the `missing-introduction` state is not entered.

status: ready
