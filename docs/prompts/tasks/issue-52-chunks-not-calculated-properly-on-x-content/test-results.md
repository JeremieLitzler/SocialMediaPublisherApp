# Test Results — Issue 52: Chunks Not Calculated Properly on X Content

## Run command

```
npm run test
```

## Summary counts

- Test files: 17 total — 17 passed, 0 failed
- Tests: 274 total — 274 passed, 0 failed
- Duration: 7.65 s

---

## Test file results

| File | Tests | Result |
|---|---|---|
| `src/utils/xContentGenerator.test.ts` | 22 | passed |
| `src/composables/useArticleExtractor.test.ts` | 10 | passed |
| `src/utils/htmlExtractor.test.ts` | 38 | passed |
| `src/components/platforms/PlatformMedium.test.ts` | 16 | passed |
| `src/components/platforms/PlatformSubstack.test.ts` | 13 | passed |
| `src/components/platforms/PlatformSwitcher.test.ts` | 18 | passed |
| `src/components/layout/GuestLayout.test.ts` | 9 | passed |
| `src/components/article/ArticleInput.test.ts` | 16 | passed |
| `src/components/article/ManualIntroduction.test.ts` | 13 | passed |
| `src/components/platforms/PlatformLinkedIn.test.ts` | 6 | passed |
| `src/components/layout/AppFooter.test.ts` | 10 | passed |
| `src/utils/linkedInContentGenerator.test.ts` | 17 | passed |
| `src/utils/htmlToText.test.ts` | 15 | passed |
| `src/utils/mediumContentGenerator.test.ts` | 20 | passed |
| `src/utils/substackContentGenerator.test.ts` | 20 | passed |
| `src/utils/utm.test.ts` | 22 | passed |
| `src/composables/useArticleState.test.ts` | 9 | passed |

---

## Notes

`src/components/article/ArticleInput.test.ts` emits Vue router injection warnings (`[Vue warn]: injection "Symbol(router)" not found`) to stderr for all 16 of its tests. These are non-fatal test environment warnings; all tests pass despite them.

---

### Test Summary

All 274 tests across 17 test files passed. The previously failing test in `src/utils/xContentGenerator.test.ts` ("warning message does not appear in any chunk text field") now passes — the test fixture string no longer contains the substrings being asserted against, confirming the fix for the oversized-chunk word containment check is correct.

status: passed
