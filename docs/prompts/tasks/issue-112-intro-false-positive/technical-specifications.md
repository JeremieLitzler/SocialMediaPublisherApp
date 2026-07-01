# Technical Specifications — Issue #112: Intro messaging + empty-introduction detection

## Files changed

- `src/composables/useArticleExtractor.ts` — introduced a fixed-literal message map keyed by
  two missing-introduction causes (`NO_HEADING`, `EMPTY`), an own-property type guard, two
  guard-clause throws in `extractArticleData` (`null` → NO_HEADING, `''` → EMPTY), and a catch
  branch that maps the thrown code to its message.
- `src/utils/htmlExtractor.ts` — documented `extractIntroduction`'s tri-state contract
  (`null` = no `<h2>`/no container, `''` = first `<h2>` with empty introduction, HTML = found).
  No behaviour change; the function already produced these three outcomes.
- `src/components/article/ManualIntroduction.vue` — made the static guidance cause-agnostic
  (removed the `<h2>`-specific sentence) so it reads correctly for both messages; the
  cause-specific text is carried by `extractionState.error` and rendered via `{{ }}`.
- `tests/fixtures/english-no-intro.html` — cleaned per the CLAUDE.md fixture rules (removed all
  `<script>` and `<link rel="stylesheet">` tags, including multi-line ones; kept canonical/icon).
  Its `.article-content` begins with `<h2 id="sources">`, giving the empty-introduction case.

## Rule / test-case coverage

- **R1/R2/R5 (TC-1..TC-3)** — `extractIntroduction` returns `null` with no `<h2>` or no
  container; the composable throws `NO_HEADING` and renders the "cannot be located, add `<h2>`"
  message, unchanged from the original #112 fix.
- **R3/R4 (TC-4/TC-5)** — `extractIntroduction` returns `''` when a first `<h2>` has no
  introduction before it; the composable throws `EMPTY` and renders the distinct "no
  introduction before the first heading, add one or enter manually" message. This is the
  behaviour change: the empty case previously succeeded with an empty introduction.
- **R6 (TC-6)** — `ManualIntroduction.vue` still renders the textarea + Continue button and its
  generic guidance for either cause; the manual-entry path to `success` is unchanged.
- **TC-7** — the found path (non-empty HTML before the first `<h2>`) is untouched.

## Non-trivial decisions (why)

- **Kept `extractIntroduction`'s `string | null` signature; distinguished causes by `''` vs
  `null`.** The function already returns `''` for the empty case and `null` for the no-heading
  case, so this needs no signature change — avoiding a breaking change to ~15 `htmlExtractor`
  test call-sites (and their `vue-tsc` type-check) while still reporting both causes distinctly.
  The tri-state is now documented so the implicit distinction is explicit.
- **Cause carried as an `Error` message code, mapped to copy in a const map.** Matches the
  existing throw/catch idiom (previously a single `MISSING_INTRODUCTION` code) and keeps the
  user-facing strings as fixed literals per security R1 — the catch never interpolates fetched
  content, it only looks up a validated internal code.
- **Own-property guard (`hasOwnProperty`) instead of the `in` operator.** `in` walks the
  prototype chain, so a stray error message such as `'constructor'`/`'toString'` would falsely
  match and index a prototype member; `hasOwnProperty` restricts matching to the two real codes.
- **Static component copy made cause-agnostic.** With two possible messages, an `<h2>`-specific
  static sentence would be wrong for the empty-introduction case; the cause-specific detail
  lives in the message, the static copy only offers manual entry (R6).

## Object Calisthenics notes

Guard clauses replace the single null-check (no `else`); helpers are small and unabbreviated;
the message map is a first-class constant. Vue composable/component conventions preserved.

## Test follow-ups owned by `/jli-writes-tests` (not written here per `/jli-codes`)

- Rewrite `src/composables/useArticleExtractor.spec.ts` to the new TC-1..TC-7: the empty-intro
  fixture (`english-no-intro.html`) now yields `missing-introduction` (the user-added TC-7 now
  passes); remove the old "first `<h2>` → success with empty introduction" assertion.
- Update the two legacy `src/components/article/ManualIntroduction.test.ts` assertions that
  referenced the removed `<h2>`-specific static sentence ("uses <h2> for its section headings"
  and "enter it manually below"); add coverage for the empty-introduction message (TC-5).
- `htmlExtractor.test.ts` and the committed `ManualIntroduction.spec.ts` remain valid (signature
  and no-heading message unchanged).

status: ready
