# Test Results — Issue #113: Introduction list extraction

## Test Run

Command: `npm test` (Vitest v4.0.18) from the `SocialMediaPublisherApp-fix_intro-list-extraction` worktree.

## Files Run

All those mentioned in [technical specs](technical-specifications.md), plus the full suite
(`rtk vitest run` runs every `*.spec.ts` / `*.test.ts` in the project).

## Results

Overall: **26 test files (1 failed, 25 passed), 374 tests (1 failed, 373 passed)**. The new
feature specs (`articleHtmlBuilder.spec.ts`, `linkedInContentGenerator.spec.ts`,
`xContentGenerator.spec.ts`) all pass. One pre-existing test in `htmlExtractor.test.ts` fails
because it still asserts the old (pre-fix) behaviour.

### Failures

```
 FAIL  src/utils/htmlExtractor.test.ts > htmlExtractor > extractIntroduction
       > expanded element types — <pre>, <ul>, <blockquote>
       > does not include <ol> elements (not in the allowlist)

AssertionError: expected '<p>Intro.</p><ol><li>ordered</li></ol>' not to contain '<ol>'

Expected: "<ol>"
Received: "<p>Intro.</p><ol><li>ordered</li></ol>"

 ❯ src/utils/htmlExtractor.test.ts:254:28
    252|         const doc = makeDoc('<p>Intro.</p><ol><li>ordered</li></ol><h2…
    253|         const result = extractIntroduction(doc)
    254|         expect(result).not.toContain('<ol>')
    255|         expect(result).toContain('<p>Intro.</p>')
    256|       })
```

**Root cause (stale test, not a code defect).** This test encodes the *former* behaviour where
`<ol>` was excluded from the extracted introduction. The round-2 loop-back fix deliberately
added `'OL'` to `INTRODUCTION_ELEMENT_TAGS` (`src/utils/htmlExtractor.ts:66`) so ordered lists
reach the LinkedIn/X generators — this is required by business-spec rule 3 and was approved in
`review-results.md`. `extractIntroduction` now correctly retains `<ol>`, so the assertion
`expect(result).not.toContain('<ol>')` is inverted relative to the intended behaviour and must
be updated (assert the introduction *includes* the `<ol>`). `htmlExtractor.test.ts` is a
pre-existing test file outside this feature's declared spec set; updating this stale assertion
is owned by `/jli-test-write`, not a source fix.

status: failed
