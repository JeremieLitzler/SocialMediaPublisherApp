# Test Results — Issue #112: Intro "false positive" messaging

## Test Run

Command: `npm test` (Vitest v4.0.18) from the `SocialMediaPublisherApp_fix-intro-false-positive`
worktree.

Note: `rtk vitest run` could not launch (`program not found` at the rtk wrapper level, same
issue as `rtk lint`), so the suite was run via `npx vitest run`.

## Files Run

All those mentioned in [technical specs](technical-specifications.md), plus the
user-added TC-7 in `src/composables/useArticleExtractor.spec.ts` and its new fixture
`tests/fixtures/english-no-intro.html`.

## Results

### Failures

**1 test failed** (383 passed, 384 total; 1 of 28 test files failed).

```
FAIL  src/composables/useArticleExtractor.spec.ts
 > useArticleExtractor — issue #112 missing-introduction messaging
 > enters missing-introduction (no platform content) for nothing <p> and co before first <h2>

AssertionError: expected 'success' to be 'missing-introduction' // Object.is equality
Expected: "missing-introduction"
Received: "success"
  at src/composables/useArticleExtractor.spec.ts:118:42
```

### Analysis (why it fails)

TC-7 feeds `english-no-intro.html`, an article that *does* contain `<h2>` headings inside
`.article-content`. The extractor's contract (unchanged by this issue) is:

- `extractIntroduction` returns `null` **only** when there is no `.article-content` **or**
  no `<h2>` anywhere inside it. `null` is what triggers `missing-introduction`.
- When a first `<h2>` exists but no qualifying intro elements precede it, it returns `''`
  (empty string, not `null`), so extraction **succeeds** with an empty introduction.

Because the fixture has `<h2>` headings, `extractIntroduction` never returns `null`, so the
state is `success` — TC-7's expected `missing-introduction` is unreachable under the current
detection logic.

### Conflicts to resolve (this is a spec/scope decision, not a code bug)

1. **TC-7 contradicts TC-6.** TC-6 asserts that an `.article-content` beginning with an
   `<h2>` and no preceding intro yields `success` with `introduction === ''`. TC-7 asserts the
   opposite outcome (`missing-introduction`) for the same structural shape. Both cannot hold.
2. **TC-7 is out of scope for issue #112.** The business spec states this change is
   "user-facing messaging only … detection logic … unchanged." Treating "has `<h2>` but no
   introduction content" as `missing-introduction` is a **detection-logic change** and is not
   among the defined scenarios (test-cases.md defines TC-1..TC-6 only).
3. **Fixture not cleaned.** `tests/fixtures/english-no-intro.html` contains 9
   `<link rel="stylesheet">`/`<script>` tags, violating the CLAUDE.md fixture-cleanup rules
   (this produces the happy-dom fetch/abort warnings during teardown).

### Resolution options

- **If TC-7 is a mistaken test** (behavior should stay as specified): remove/rewrite TC-7 via
  `/jli-writes-tests` and the suite is green (383/383 of the in-scope tests already pass).
- **If TC-7 reflects a genuine new requirement** ("an article with headings but no intro
  paragraphs before the first `<h2>` should be flagged as missing-introduction"): that is a new
  detection behavior — update the business spec + test-cases first (`/jli-writes-spec`,
  `/jli-writes-tests-spec`), then change `extractIntroduction` via `/jli-codes`. Also clean the
  fixture per the CLAUDE.md rules.

status: failed
