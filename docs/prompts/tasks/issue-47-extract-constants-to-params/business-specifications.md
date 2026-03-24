# Business Specifications — Extract Constants to Parameters (Issue #47)

## Goal

Allow users to view and edit the text snippets (constants) used when generating platform content,
so that personalised wording can be set once and reused across sessions without modifying source code.

## Scope

All user-visible text snippets currently hardcoded in `src/config/snippets.ts` must become
user-editable parameters. Persistence uses IndexedDB as decided in ADR-008.

## Constants Inventory

Six constants exist, grouped by platform:

**Substack (both languages):**
- EN share-block sentence (English Substack share block)
- FR share-block sentence (French Substack share block)
- EN UTM anchor text (English link anchor to full article)
- FR UTM anchor text (French link anchor to full article)

**Medium (both languages):**
- EN "Why" snippet: heading + body HTML (English cross-post explanation)
- FR "Why" snippet: heading + body HTML (French cross-post explanation)

The Medium "Why" snippet has two sub-fields (heading and body HTML) per language.
The Substack constants are plain text strings.

## Rules

**R1 — Settings page exists**
A dedicated settings page is accessible from the app navigation.
It displays all constants grouped into sections: one section per platform (Substack, Medium),
plus a shared section if any constant applies to two or more platforms.
Currently no constant is shared across platforms, so no shared section is required.

**R2 — Constants are editable**
Each constant is displayed with its current value and an input control appropriate to its content:
plain text for Substack constants; a larger text area or rich editor for Medium body HTML.
The user can modify any value directly on the page.

**R3 — Values persist across sessions via IndexedDB**
On save, values are written to IndexedDB (per ADR-008). On subsequent visits, the stored values
are loaded and used instead of the hardcoded defaults.
Example: a user changes the EN UTM anchor text, closes the tab, reopens the app — the custom
text appears in the input field and is used during Substack content generation.

**R4 — App updates do not overwrite persisted values**
When the application loads, it reads each key from IndexedDB. If a key exists, its stored value
is used. If a key does not exist (first run or key was removed by a new version), the hardcoded
default from `src/config/snippets.ts` is used.
A "Reset to defaults" action clears all stored values, causing the app to fall back to defaults.

**R5 — Content generation uses live values**
All platform generators (Substack, Medium) read the current parameter values at generation time —
whether from storage or from defaults — not from hardcoded constants directly.

**R6 — Navigation includes the settings page**
The settings page is reachable via the existing navigation menu (`src/config/menu.ts`).

## Files to Create or Modify

- `src/pages/settings.vue` — new page; displays and saves all editable constants
- `src/config/snippets.ts` — modified; hardcoded values become defaults; getters read from a
  parameters composable rather than directly from module-level constants
- `src/composables/useSnippets.ts` — new composable; manages current snippet values, merging
  IndexedDB-persisted values over defaults; exposes a save and a reset operation
- `src/composables/useIndexedDb.ts` — new composable; thin IndexedDB wrapper per ADR-008
  (get, set, del); may already exist — check before creating
- `src/config/menu.ts` — modified; adds a navigation entry for the settings page
- `src/types/article.ts` — possibly modified if a new type is needed for the snippet parameter map

status: ready
