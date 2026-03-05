# Test Results — Task 041: Allow Switching to a Different Platform

## Test file

`src/components/platforms/PlatformSwitcher.test.ts`

## Environment

- Vitest v4.0.18
- happy-dom
- @vue/test-utils
- vue-router mocked via `vi.mock`

## Tests written

| # | Description | AC | Result |
|---|---|---|---|
| 1 | renders nothing when article is null | AC-6 | passed |
| 2 | renders three buttons when article is loaded and current platform is X | AC-1 | passed |
| 3 | renders buttons for LinkedIn, Medium, Substack when current platform is X | AC-1 | passed |
| 4 | renders buttons for X, Medium, Substack when current platform is LinkedIn | AC-1 | passed |
| 5 | renders buttons for X, LinkedIn, Substack when current platform is Medium | AC-1 | passed |
| 6 | renders buttons for X, LinkedIn, Medium when current platform is Substack | AC-1 | passed |
| 7 | does not render a button for X when current platform is X | AC-3 | passed |
| 8 | does not render a button for LinkedIn when current platform is LinkedIn | AC-3 | passed |
| 9 | does not render a button for Medium when current platform is Medium | AC-3 | passed |
| 10 | does not render a button for Substack when current platform is Substack | AC-3 | passed |
| 11 | calls router.push("/linkedin") when LinkedIn button is clicked from X | AC-2 | passed |
| 12 | calls router.push("/medium") when Medium button is clicked from X | AC-2 | passed |
| 13 | calls router.push("/substack") when Substack button is clicked from X | AC-2 | passed |
| 14 | calls router.push("/x") when X button is clicked from LinkedIn | AC-2 | passed |
| 15 | updates selectedPlatform to LinkedIn when LinkedIn button is clicked | AC-4 | passed |
| 16 | preserves article data after platform switch | AC-4 | passed |
| 17 | does not invoke resetState when switching platforms | AC-4 | passed |
| 18 | renders the switcher heading when article is loaded | AC-1 | passed |

## Coverage of acceptance criteria

- **AC-1**: Covered by tests 2–6 and 18. The switcher renders exactly the other three platform buttons plus the heading.
- **AC-2**: Covered by tests 11–14. `router.push` is called with the correct `RouterPathEnum` route path; no network call is made (the fetch composable is not invoked).
- **AC-3**: Covered by tests 7–10. Each platform is absent from the rendered button list when it is the `currentPlatform` prop.
- **AC-4**: Covered by tests 15–17. `selectedPlatform` is updated to the target platform, `article` remains identical (deep equality check), and `resetState` is not called.
- **AC-6**: Covered by test 1. The `.platform-switcher` element is absent when `extractionState.article` is `null`.
- **AC-7**: Structural — verified by reading `src/pages/index.vue` which does not include `<PlatformSwitcher>`. No unit test needed.
- **AC-5**: Not in scope for `PlatformSwitcher.vue` — "Start Over" is tested in individual platform page tests (`PlatformLinkedIn.test.ts`, `PlatformMedium.test.ts`, `PlatformSubstack.test.ts`).

## Full suite results

```
Test Files  15 passed (15)
      Tests 257 passed (257)
   Duration 7.43s
```

No regressions introduced. All pre-existing tests continue to pass.

## Notes

- The `Button` stub uses `@click="$emit('click')"` to propagate click events from the stubbed element back to the component, matching the `@click="switchToPlatform(platform)"` binding in the template.
- `vue-router` is mocked at the module level with `vi.hoisted` so `mockPush` is available inside the hoisted factory, consistent with the pattern used in all existing platform component tests.
- `useArticleState` is mocked per-test via `beforeEach` so each test has an isolated reactive state.

status: passed
