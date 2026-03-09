# Issue 51 — The "Back" button in browser fail to load index page from a platform page

## User Request

When navigating the app with the following steps:
1. Browse to the index page.
2. Type an article URL and click "Extract".
3. Hit the browser back button.

The index page component is not loaded properly (the ArticleInput form remains hidden).

## Root Cause

`useArticleState` uses a module-level singleton `ref`. After a successful extraction, `extractionState.status` becomes `'success'`. When the user navigates to a platform page and then presses the browser back button to return to `index.vue`, the status remains `'success'`, causing `ArticleInput` to be hidden by the `v-if="extractionState.status !== 'success'"` condition.

## Expected Behavior

When the user navigates back to the index page (via browser back button or any navigation), the extraction state should be reset to `'idle'` so the ArticleInput form is shown.
