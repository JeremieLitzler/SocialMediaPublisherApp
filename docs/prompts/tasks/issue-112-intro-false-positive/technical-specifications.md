# Technical Specifications — Issue #112: Intro "false positive" messaging

## Scope confirmation

Investigation of `example-ko.html` confirms the spec's diagnosis: inside `.article-content`
the section headings are `<h3>` (`#association`, `#agrégation`, `#composition`) and every
`<h2>` in the page lives **outside** `.article-content` (the TOC widget, the
`h2.article-subtitle`, and the related-content tiles). `extractIntroduction` therefore
returns `null` for the right reason (no `<h2>` inside `.article-content`), and the
`missing-introduction` outcome is correct. This change is **user-facing messaging only** —
detection logic, the `<h2>` boundary, the introduction tag set, and `ExtractionState` values
are untouched.

## Files changed

- `src/composables/useArticleExtractor.ts` — reworded the `error` text carried into the
  `missing-introduction` state to name the true cause (no `<h2>` section heading, so the end
  of the introduction cannot be located) and direct the author to fix the source article.
  Removed the false "must have paragraphs" claim.
- `src/components/article/ManualIntroduction.vue` — realigned the surrounding static copy:
  heading changed from "Missing Introduction" to "Introduction Not Detected"; the guidance
  line no longer asks the author to "add an introduction" (which implied missing content) and
  instead explains the `<h2>` fix while continuing to offer manual entry as the immediate
  workaround.

## Files NOT changed (and why)

- `src/utils/htmlExtractor.ts` — detection is correct; spec forbids changing it.
- `src/pages/index.vue` — it only mounts `ManualIntroduction` and carries no duplicated
  cause-copy, so no R3 alignment is needed there.

## Rule / test-case coverage

- **R1 / TC-1** — no change to detection: an `<h3>`-only `.article-content` still returns
  `null` and enters `missing-introduction`.
- **R2 / TC-2** — the new message names the `<h2>` cause, states the introduction end cannot
  be located, directs the author to use `<h2>`, and no longer asserts missing paragraphs.
- **R3 / TC-4** — `ManualIntroduction.vue` copy now agrees with R2 and still presents the
  manual textarea + Continue button as the immediate workaround; `handleContinue` behaviour
  is unchanged.
- **R4 / TC-3** — the missing-`.article-content` path already funnels through the same
  `MISSING_INTRODUCTION` branch, so it inherits the same reworded message; no separate flow
  is introduced, and the message does not falsely assert missing paragraphs.
- **TC-5 / TC-6** — untouched detection guarantees the success path and the "first child is
  `<h2>`" shape behave exactly as before.

## Non-trivial decisions (why)

- **Single shared message for both null causes (no `<h2>` and no `.article-content`).** R4
  explicitly mandates one message and "no separate flow." Both cases genuinely lack an `<h2>`
  inside the article container, so one `<h2>`-focused message is accurate for both without
  distinguishing them in `extractArticleData` — keeping the composable's control flow
  unchanged.
- **Message string kept as a plain primitive (no domain wrapper type).** Object Calisthenics
  rule 3 (wrap meaningful primitives) is deliberately not applied here: the existing
  `ExtractionState.error` field is a `string`, the change is messaging-only, and introducing a
  message value-object would ripple into the shared state shape — out of scope and against the
  "no new pattern / no ADR" constraint. Documented as a framework/scope exception.
- **Heading renamed to "Introduction Not Detected".** "Missing Introduction" leans toward the
  old (wrong) implication that content is absent; "Not Detected" matches R2's framing that the
  boundary could not be located, not that the intro is missing.

## Object Calisthenics notes

The diff is two string edits inside existing Vue-idiomatic code; no new methods, classes, or
control flow were added. Existing composable/component conventions (`useXxx`, `setup()` top-
level calls, lifecycle hooks) are preserved.

## Follow-up owned by the test phase (not written here per `/jli-codes`)

`/jli-codes` does not author test assets, so the following are left for
`/jli-writes-tests-spec` / `/jli-writes-tests`:

- Create the cleaned fixture under `tests/fixtures/` derived from `example-ko.html` (remove
  the 2 `<link rel="stylesheet">` and 2 `<script>` tags per the CLAUDE.md fixture rules; keep
  `rel="canonical"`/`shortcut icon`). It has no `<h2>` inside `.article-content`.
- Update the two existing tests that still assert the OLD wording, which this change
  intentionally breaks:
  - `src/composables/useArticleExtractor.test.ts:118` (`toContain('No introduction found')`)
  - `src/components/article/ManualIntroduction.test.ts:29,41` (old error string and
    `toContain('No introduction found')`)
  These should assert the new cause text (mentions `<h2>`, does not mention missing
  paragraphs) per TC-2.

status: ready
