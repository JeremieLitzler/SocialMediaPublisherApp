# Test Results — Issue 51: Browser Back Button Fails to Load Index Page from a Platform Page

## Test File Added

`src/__tests__/index.spec.ts`

## Tests Written

5 tests covering the happy paths and edge cases from the business specification:

1. **resets extraction state to idle on mount when status is success** — verifies the back-button bug fix: state was `success`, after mount it is `idle`.
2. **resets extraction state to idle on mount when status is error** — verifies error state is cleared on re-entry.
3. **resets extraction state to idle on mount when status is missing-introduction** — verifies missing-introduction fallback is not shown on re-entry.
4. **shows ArticleInput when status is idle after mount** — verifies the input form condition is satisfied after reset.
5. **is a no-op when status is already idle on mount** — verifies the reset causes no observable change when state is already idle.

## Full Test Run Output

```
 RUN  v4.0.18

 ✓ src/utils/xContentGenerator.test.ts (22 tests) 27ms
 ✓ src/components/platforms/PlatformSwitcher.test.ts (18 tests) 196ms
 ✓ src/composables/useArticleExtractor.test.ts (10 tests) 449ms
 ✓ src/utils/linkedInContentGenerator.test.ts (17 tests) 21ms
 ✓ src/utils/htmlExtractor.test.ts (38 tests) 1061ms
 ✓ src/utils/utm.test.ts (22 tests) 13ms
 ✓ src/components/platforms/PlatformMedium.test.ts (16 tests) 259ms
 ✓ src/components/article/ArticleInput.test.ts (16 tests) 226ms
 ✓ src/utils/mediumContentGenerator.test.ts (20 tests) 21ms
 ✓ src/composables/useArticleState.test.ts (9 tests) 12ms
 ✓ src/components/article/ManualIntroduction.test.ts (13 tests) 128ms
 ✓ src/components/platforms/PlatformSubstack.test.ts (13 tests) 219ms
 ✓ src/utils/substackContentGenerator.test.ts (20 tests) 14ms
 ✓ src/components/platforms/PlatformLinkedIn.test.ts (6 tests) 95ms
 ✓ src/components/layout/AppFooter.test.ts (10 tests) 87ms
 ✓ src/components/layout/GuestLayout.test.ts (9 tests) 107ms
 ✓ src/utils/htmlToText.test.ts (15 tests) 15ms
 ✓ src/__tests__/index.spec.ts (5 tests) 113ms

 Test Files  18 passed (18)
       Tests  279 passed (279)
    Start at  19:19:35
    Duration  10.30s
```

## Notes

The `ArticleInput.test.ts` suite emits `[Vue warn]: injection "Symbol(router)" not found` warnings — these are pre-existing (the component uses router internally but tests don't provide a router plugin). All tests still pass. Our new test suite provides the router plugin and produces no warnings beyond one expected `Failed to resolve component: Textarea` in the missing-introduction scenario (also pre-existing, component is not globally registered in the test environment).

### Test Summary

5 new tests added, 279 total tests passing across 18 test files. All new tests pass. No regressions.

status: passed
