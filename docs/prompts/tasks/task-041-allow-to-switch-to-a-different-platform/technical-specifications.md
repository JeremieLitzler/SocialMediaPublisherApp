# Technical Specifications — Task 041: Allow Switching to a Different Platform

## Files Created

### `src/components/platforms/PlatformSwitcher.vue`

New component that renders outline buttons for every platform except the active one. Clicking a button updates `extractionState.value.selectedPlatform` and navigates via `useRouter` to the corresponding route. Renders nothing (via `v-if="extractionState.article"`) when no article is in state — satisfying R-7 and AC-6 without needing a redirect because the parent platform page already handles the no-article guard with its own `v-if` / `v-if="!article"` blocks.

## Files Modified

### `src/components/platforms/PlatformX.vue`

Added `<PlatformSwitcher current-platform="X" />` as the first child of the `v-if="article"` content block, above the header. No other changes.

### `src/components/platforms/PlatformLinkedIn.vue`

Added `<PlatformSwitcher current-platform="LinkedIn" />` as the first child of the `v-if="article"` content block, above the header. No other changes.

### `src/components/platforms/PlatformMedium.vue`

Added `<PlatformSwitcher current-platform="Medium" />` as the first child of the `v-if="article && content"` content block, above the header. No other changes.

### `src/components/platforms/PlatformSubstack.vue`

Added `<PlatformSwitcher current-platform="Substack" />` as the first child of the `v-if="article && content"` content block, above the header. No other changes.

## Implementation Decisions

### Why `v-if="extractionState.article"` inside the switcher rather than a route guard

The business spec (R-7, AC-6) requires no switcher when there is no article. The existing platform pages already show a "No article loaded" fallback when `!article`. Adding a guard inside `PlatformSwitcher` that checks `extractionState.article` keeps the component self-contained and avoids duplicating navigation logic. The parent's `v-if="article"` already prevents `PlatformSwitcher` from mounting when there is no article, making the inner guard doubly safe.

### Why the `platformRoutes` map uses `Record<Platform, RouterPathEnum>` rather than a switch

A `Record` lookup is a single expression evaluated in constant time, keeps the mapping co-located, and avoids a branching `switch`/`if` chain — consistent with Object Calisthenics rule 2 (no `else`).

### Why `allPlatforms` is a plain array rather than extracted to a utility

The array has four fixed members that mirror the `Platform` union type. Extracting it to a shared utility would add an indirection with no reuse benefit at this stage. If a fifth platform is ever added, `Platform`, `RouterPathEnum`, and this array are the three places to update.

### Why `computed` is used for `otherPlatforms` rather than a method

`computed` caches the result and re-evaluates only when `props.currentPlatform` changes. A method would re-run on every render. Given `currentPlatform` is a static prop at runtime per page, this is a minor but correct choice.

### Vue framework exception (Object Calisthenics rule 7 — entity size)

`PlatformSwitcher` has a `platformRoutes` constant with four entries, making the script slightly wider than a strict 5-line-per-block reading might allow. This is a data declaration, not a logic method, and Vue SFC conventions require it to live inside `<script setup>`. This exception is documented here per agent-2-coder.md guidance.

### Why explicit imports are used in `PlatformSwitcher.vue` despite auto-import configuration

The existing platform components (`PlatformX.vue`, `PlatformLinkedIn.vue`, etc.) explicitly import `useArticleState`, `useRouter`, and Vue composition functions even though these are listed in `auto-imports.d.ts`. `PlatformSwitcher.vue` follows the same convention for consistency and to make dependencies visible to readers.

status: ready
