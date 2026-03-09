# Technical Specifications — Issue 51: Browser Back Button Fails to Load Index Page from a Platform Page

## Files Changed

### `src/pages/index.vue`

This is the only file modified. Two lines were added inside the `<script setup>` block:

1. `resetState` is destructured from the existing `useArticleState()` call alongside the already-present `extractionState`.
2. An `onMounted` lifecycle hook is added that calls `resetState()` unconditionally.

No other files were touched. `src/composables/useArticleState.ts` and `src/router/index.ts` are unchanged, as instructed.

The root cause of the bug is that `useArticleState` stores its state in a module-level `ref` — a JavaScript singleton that survives for the full browser session. When the user navigates to a platform page and then presses the browser back button, Vue destroys and re-creates `index.vue` (no `<keep-alive>` is used). However, the module-level state is not recreated with it: `status` remains `'success'`, which hides the article input form via `v-if="extractionState.status !== 'success'"`. The page appears blank. Calling `resetState()` on mount sets `status` back to `'idle'` and restores the input form.

## Technical Choice Explanations

### Why `onMounted` rather than `onBeforeMount`

`onBeforeMount` fires before the component's DOM is created, while `onMounted` fires after the first render is complete. In this case, calling `resetState()` in either hook produces the same user-visible result because both hooks execute before the browser has painted the updated frame — Vue batches the reactive update triggered by `resetState()` and the initial render into a single flush. `onMounted` is the conventional Vue hook for side effects that should run once on component entry and is the more semantically appropriate choice for a state initialisation side effect.

### Why a component-local `onMounted` hook rather than a global `router.beforeEach` guard

The `router.beforeEach` guard in `src/router/index.ts` currently has an empty body. The reset could have been placed there, scoped to `to.name === '/'` or equivalent. The `onMounted` approach was chosen instead for three reasons:

1. **Colocation.** The reset is a concern of the index page. Placing the logic in the component keeps the reset behaviour visible alongside the template that depends on it, rather than hidden in a global router file.
2. **Minimal diff.** Only one file changes. Touching `src/router/index.ts` would widen the change surface unnecessarily.
3. **Security compliance.** The security guidelines require that the route-identity check used to scope the reset be compared against a hardcoded constant rather than a runtime navigation value. With `onMounted` in `index.vue`, there is no route-identity check at all — Vue's own routing guarantees that `index.vue` is only mounted when the index route is active. This is the safest possible form of scoping.

### Why `resetState()` is called unconditionally

The business specification (Rule 1) and the security guidelines (Rule 1) both require the reset to be unconditional — it must not branch on any URL-derived value or on the current value of `extractionState.status`. Calling `resetState()` when `status` is already `'idle'` is a no-op in observable terms (the state shape is identical before and after), so the unconditional call satisfies both the correctness and security requirements without any added complexity.

## Self-Code Review

### Potential issue 1 — Race condition with in-flight network requests

If the user presses the browser back button while an extraction request is still in progress, `useArticleExtractor` may resolve its `fetch` call after `resetState()` has already executed and write a `'success'` or `'error'` status back to the singleton. This would overwrite the idle state the reset established.

Assessment: this risk is acknowledged in the security guidelines (Rule 5) and in the business specification (Example 5). The fix itself — calling `resetState()` in `onMounted` — is the correct and sufficient action on the index page's side. Preventing the in-flight callback from overwriting the reset is a concern for `useArticleExtractor`, which is explicitly out of scope for this change. The specification confirms that "any in-flight network request may still complete, but its result must not alter the visible state of the index page once the reset has occurred." Addressing the extractor's race condition is a separate, future task.

### Potential issue 2 — `onMounted` does not fire on `<keep-alive>` reactivation

If `<keep-alive>` were ever introduced for `index.vue`, `onMounted` would only fire on the first mount, not on subsequent activations. The `onActivated` hook would be needed instead. In the current codebase, `<keep-alive>` is not used (confirmed by reading `src/router/index.ts` and `CLAUDE.md`), so `onMounted` fires on every navigation to the index route. This assumption should be documented as a constraint: if `<keep-alive>` is ever added for `index.vue`, this hook must be migrated to `onActivated` (or both hooks must be used).

### Potential issue 3 — `onMounted` is auto-imported; no explicit import is required

The `CLAUDE.md` documents that Vue Composition API functions including `onMounted` are auto-imported via `vite.config.ts`. The implementation relies on this auto-import and therefore adds no explicit `import { onMounted } from 'vue'` statement. If the auto-import configuration were ever removed or scoped differently, this file would silently break at runtime rather than at compile time. The risk is low given that auto-imports are a foundational project convention, but it is worth noting that the correctness of this file depends on the Vite plugin configuration remaining in place.

status: ready
