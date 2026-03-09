# Business Specification — Issue 51: Browser Back Button Fails to Load Index Page from a Platform Page

## Goal and Scope

The extraction workflow on the index page becomes inaccessible after the user navigates away and returns via the browser's back button. The article input form is conditionally hidden when the extraction state holds a `success` status. Because the shared state is a module-level singleton that persists for the lifetime of the browser session, navigating back to the index page does not reset that status, so the input form remains hidden and the page appears blank.

The goal of this change is to ensure that whenever the index page is (re-)entered — whether by a direct visit, a browser back navigation, a browser forward navigation, or any other routing transition — the extraction state is reset to its initial idle state, and the article input form is visible to the user.

The scope is limited to the navigation lifecycle hook that triggers state reset upon entry to the index page. No changes to the extraction workflow itself, the state shape, or any platform content pages are required.

## Rules

### Rule 1 — State Reset on Index Page Entry

When the index page is activated as the current route, the extraction state must be unconditionally reset to idle before the page is rendered to the user.

This rule applies regardless of:
- The previous route (platform page, direct URL visit, bookmark, or any other origin).
- The navigation direction (back, forward, or fresh visit).
- The current value of the extraction state at the time of navigation.

### Rule 2 — Idle State Definition

The idle state is the same initial state the application starts with: no article data, no error, no manual introduction text, no selected platform, and a status of idle. After the reset, the index page must display the article input form.

### Rule 3 — No Side Effects on Other Routes

The reset must only occur when the index page is entered. Navigating between platform pages, or any other route transition that does not target the index page, must not trigger a state reset.

## Example Mapping

### Example 1 — Happy path: back button after successful extraction

Given the user has visited the index page, entered a URL, and completed a successful extraction (reaching a platform view or any post-extraction state), when the user presses the browser back button to return to the index page, then the article input form is visible and ready to accept a new URL.

### Example 2 — Happy path: fresh page load

Given the user loads the index page for the first time in a session, when the page finishes loading, then the article input form is visible (state was already idle; the reset is a no-op in observable terms).

### Example 3 — Happy path: navigating forward back to index

Given the user has navigated away from the index page and then returned to it using the browser's forward button, when the index page is displayed, then the extraction state is reset and the article input form is visible.

### Example 4 — Edge case: rapid back-forward navigation

Given the user presses back and forward in quick succession between the index page and a platform page, when the index page becomes the active view each time, then the article input form is always visible on the index page and platform content is always visible on the platform page. No intermediate or inconsistent state is exposed to the user.

### Example 5 — Edge case: extraction in progress when back button is pressed

Given the user has started an extraction (loading state) and immediately presses the browser back button while the extraction is still running, when the index page is displayed, then the extraction state is reset to idle and the article input form is visible. Any in-flight network request may still complete, but its result must not alter the visible state of the index page once the reset has occurred.

### Example 6 — Edge case: error state on return

Given the user has reached an error state after a failed extraction and has navigated away to another page, when the user presses the browser back button to return to the index page, then the error state is cleared, the article input form is visible, and no error message is displayed.

### Example 7 — Edge case: missing-introduction state on return

Given the user has reached the manual introduction fallback (missing-introduction status) and has navigated away, when the user presses the browser back button to return to the index page, then the missing-introduction fallback form is not shown and the article input form is visible instead.

## Files to Create or Modify

### `src/pages/index.vue`

This file is the index page component. It is responsible for reading the shared extraction state and conditionally rendering the article input form, the manual introduction fallback, and any post-extraction content. This file must be modified to hook into the Vue Router navigation lifecycle so that, each time the index page is entered, the extraction state is reset to idle before the component renders its reactive content to the user.

### `src/composables/useArticleState.ts`

This file manages the singleton extraction state and already exposes a reset capability. No modification is expected, as the reset operation is already available. This file is listed for reference to confirm the reset contract it provides is sufficient for the fix.

### `src/router/index.ts`

The router is configured with a `beforeEach` guard that currently has an empty body. Depending on implementation approach chosen by the coder agent, a route-level navigation guard or a component lifecycle hook in `index.vue` will be used. If a global guard is used to scope the reset to the index route, this file will require modification. If a component-local activation hook is preferred, this file does not need to change. The spec does not prescribe which approach to use.

## Concurrency and Performance

The state reset must complete synchronously before the index page component renders its template. No asynchronous operations are required or permitted for the reset itself.

The fix must not introduce any observable delay in page rendering. Users must not see a flash of the post-extraction content (platform sections or hidden input form) before the reset takes effect.

The fix must not interfere with simultaneous reads of the shared state from other components that may be in the process of unmounting while the index page is mounting.

status: ready
