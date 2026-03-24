# Technical Specifications — Extract Constants to Parameters (Issue #47)

## Overview

User-editable snippet values are managed by a new `useSnippets` composable backed by a thin `useIndexedDb` wrapper. Platform content generators receive the live snippet map via an optional parameter (defaulting to hardcoded defaults). A new `/settings` page lets users view, edit, and reset all constants.

## New Files

### `src/composables/useIndexedDb.ts`

Thin IndexedDB wrapper (ADR-008). Module-level `dbPromise` caches the open connection.

- `openDb()` — private; opens the `social-media-publisher` database (version 1, store name `snippets`); resets `dbPromise = null` on error so the next call retries.
- `get(key: string): Promise<string | undefined>` — returns `undefined` (not `null`) for absent keys; type-narrows the retrieved value to `string` before returning.
- `set(key: string, value: string): Promise<void>` — uses `IDBObjectStore.put`.
- `del(key: string): Promise<void>` — uses `IDBObjectStore.delete`; resolves for unknown keys.
- Error messages are generic strings (no raw values logged, per security-guidelines.md rule 3).

### `src/composables/useSnippets.ts`

Module-level singleton `snippets = ref<SnippetMap>({ ...SNIPPET_DEFAULTS })`.

- `load()` — reads all `SnippetKey` keys from IndexedDB in parallel; merges valid strings over a fresh copy of `SNIPPET_DEFAULTS`; ignores per-key errors silently. Updates `snippets.value`.
- `save(key, value)` — coerces to `String(value)`, calls `db.set`, updates `snippets.value` reactively.
- `reset()` — calls `db.del` for all keys in parallel, sets `snippets.value = { ...SNIPPET_DEFAULTS }`.
- Returns `{ snippets: readonly(snippets), load, save, reset }`.

### `src/pages/settings.vue`

- Uses `useSnippets` composable.
- `onMounted`: calls `load()`, then copies `snippets.value` into a local `ref` for two-way binding.
- No URL params or route params are read (security-guidelines.md rule 5).
- "Save all": iterates all keys; sanitizes `EN_WHY_BODY_HTML` and `FR_WHY_BODY_HTML` via `sanitizeBodyHtml` before calling `save` (security-guidelines.md rule 1).
- "Reset to defaults": calls `reset()`, re-syncs local ref.
- Substack section: four `<input type="text">` fields (EN/FR share block, EN/FR UTM anchor).
- Medium section: two groups (EN, FR), each with `<input type="text">` for heading and `<textarea>` for body HTML.

### `src/__tests__/setup-indexeddb.ts`

Vitest setup file. Sets `globalThis.indexedDB = new IDBFactory()` and `globalThis.IDBKeyRange = IDBKeyRange` from `fake-indexeddb`, polyfilling the missing IndexedDB API in `happy-dom`.

### `src/composables/useIndexedDb.test.ts`

Tests TC-14, TC-15, TC-16. Uses unique key names per test for isolation within the shared in-memory store.

### `src/composables/useSnippets.test.ts`

Tests TC-11, TC-12, TC-13. Calls `reset()` in `beforeEach` to restore clean state. Also tests: reactive update on save without `load()`, and readonly guard on `snippets`.

## Modified Files

### `src/types/article.ts`

Added `SnippetKey` union type (8 keys) and `SnippetMap = Record<SnippetKey, string>`.

### `src/config/snippets.ts`

- Old module-level constants removed from module scope; their values now live in `SNIPPET_DEFAULTS: Readonly<SnippetMap>`.
- `getSubstackShareBlockText(blog, snippets?)`, `getSubstackUtmAnchorText(blog, snippets?)`, `getWhySnippet(blog, snippets?)` now accept an optional `SnippetMap` parameter defaulting to `SNIPPET_DEFAULTS`. Existing call sites without the parameter continue to use defaults.
- `WhySnippet` interface preserved.

### `src/utils/substackContentGenerator.ts`

`generateSubstackContent(article, snippets?)` — passes `snippets` to `getSubstackShareBlockText` and `getSubstackUtmAnchorText`. Default = `SNIPPET_DEFAULTS`. Existing tests pass unchanged.

### `src/utils/mediumContentGenerator.ts`

`generateMediumContent(article, snippets?)` — passes `snippets` to `getWhySnippet`. Default = `SNIPPET_DEFAULTS`. Existing tests pass unchanged.

### `src/components/platforms/PlatformSubstack.vue`

Imports `useSnippets`; calls `load()` on `onMounted`; passes `snippets.value` as second argument to `generateSubstackContent` inside the computed.

### `src/components/platforms/PlatformMedium.vue`

Same pattern as `PlatformSubstack.vue` but for `generateMediumContent`.

### `src/types/RouterPathEnum.ts`

Added `Settings = '/settings'`.

### `src/components/layout/SideBar.vue`

Added `{ to: RouterPathEnum.Settings, icon: Settings2, label: 'Settings' }` to `sideBarLinks`.

### `src/components/platforms/PlatformSubstack.test.ts` / `PlatformMedium.test.ts`

- Added `vi.mock('@/composables/useSnippets')` and mock setup in `beforeEach`.
- Updated `toHaveBeenCalledWith(article)` → `toHaveBeenCalledWith(article, expect.any(Object))`.

### `vitest.config.ts`

Added `setupFiles: ['src/__tests__/setup-indexeddb.ts']`.

### `package.json` / `package-lock.json`

Added `fake-indexeddb` as a devDependency.

## Test Results

All 21 test files pass (330 tests). TypeScript type-check: no errors.

status: ready
