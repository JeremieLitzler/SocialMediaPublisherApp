Worktree: /e/Git/GitHub/SocialMediaPublisherApp_fix-missing-intro-fallback

# Issue #125: Missing-introduction fallback is invisible on platform routes

## Problem

When an article resolves to the `missing-introduction` state (e.g. `tests/fixtures/english-no-intro.html`: a first `<h2>` with no introduction before it, or `tests/fixtures/french-no-h2.html`: no `<h2>`), the missing-introduction fallback message is **not visible** if the user is on a platform route (`/linkedin`, `/x`, `/medium`, `/substack`). It only ever appears on the home page (`/`).

## Root cause

The fallback UI (`<ManualIntroduction />`) is rendered **only** by `src/pages/index.vue`, gated on `extractionState.status === 'missing-introduction'`. The platform pages render only their platform component. Three chained reasons:

1. **Platform pages have no missing-introduction branch.** `src/pages/index.vue:34-39` renders `<ManualIntroduction>`; `src/pages/linkedin.vue` is just `<PlatformLinkedIn />` (same for the other platform pages).
2. **Platform components redirect away on a null article.** For a missing-introduction result the composable sets `status: 'missing-introduction'` **and `article: null`**. `src/components/platforms/PlatformLinkedIn.vue:12-14` does `watchEffect(() => { if (!article.value) router.replace('/') })`, so a null article bounces the user to `/`.
3. **`index.vue` resets state on mount.** `src/pages/index.vue:49-51` runs `onMounted(() => resetState())`, and `resetState()` sets `status` back to `'idle'` (`src/composables/useArticleState.ts:36-44`). So after the redirect the user lands on a fresh `ArticleInput` form, not the missing-introduction message.

Net: a missing-introduction article (`article === null`) on a platform route redirects home, and home resets to idle — the message is cleared before it can render.

## Proposed direction (needs a design decision)

- Decide where the missing-introduction fallback should live: surface on platform routes ONLY.
- If it should survive a platform-route redirect, reconcile the `router.replace('/')` in the platform components with the unconditional `onMounted(resetState())` in `index.vue` so a `missing-introduction` status is preserved rather than reset to `idle`.
- Likely warrants an ADR touching the reset-on-mount behavior and/or the platform redirect.

## Reproduction

1. Be on `/`
2. Trigger extraction for an article with no introduction before its first `<h2>` (e.g. the `english-no-intro.html` fixture shape).
3. Navigate to a platform route such as `/linkedin`.
4. Observe: the missing-introduction message is not shown.
