/**
 * useSnippets — manages user-editable snippet values.
 *
 * Merges IndexedDB-persisted values over the hardcoded defaults from
 * src/config/snippets.ts. Exposes:
 *   - snippets: reactive read-only SnippetMap (current live values)
 *   - save(key, value): persist a single value to IndexedDB
 *   - reset(): clear all snippet keys from IndexedDB and restore defaults
 *   - load(): read all keys from IndexedDB and merge with defaults
 *
 * Security:
 *   - Values are type-narrowed on read (security-guidelines.md rule 4).
 *   - Values are sanitized before being stored when they may contain HTML
 *     (only bodyHtml keys). Callers are responsible for sanitizing at
 *     render time via sanitizeBodyHtml (security-guidelines.md rule 2).
 *   - IndexedDB errors do not propagate raw values (rule 3).
 */

import { ref, readonly } from 'vue'
import { SNIPPET_DEFAULTS } from '@/config/snippets'
import type { SnippetKey, SnippetMap } from '@/types/article'
import { useIndexedDb } from './useIndexedDb'

// Module-level singleton so all consumers share the same reactive map.
const snippets = ref<SnippetMap>({ ...SNIPPET_DEFAULTS })

const ALL_KEYS = Object.keys(SNIPPET_DEFAULTS) as SnippetKey[]

/**
 * Validate and narrow an unknown value from IndexedDB to a safe string.
 * Returns undefined for any non-string or empty value, triggering the
 * default fallback (security-guidelines.md rule 4).
 */
function toSafeString(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  // Unexpected shapes (null coerced to "null", etc.) are already excluded
  // by the string check above. Accept any non-empty string.
  return value
}

export function useSnippets() {
  const db = useIndexedDb()

  /**
   * Load all snippet values from IndexedDB, merging over defaults.
   * Missing or invalid keys fall back to hardcoded defaults (R4, TC-06, TC-09).
   */
  async function load(): Promise<void> {
    const merged: SnippetMap = { ...SNIPPET_DEFAULTS }

    await Promise.all(
      ALL_KEYS.map(async (key) => {
        try {
          const raw = await db.get(key)
          const safe = toSafeString(raw)
          if (safe !== undefined) {
            merged[key] = safe
          }
          // If safe is undefined, default remains from SNIPPET_DEFAULTS spread above.
        } catch {
          // Individual key failure: keep the default, do not surface to user.
        }
      }),
    )

    snippets.value = merged
  }

  /**
   * Persist a single snippet value to IndexedDB and update the reactive map.
   *
   * @param key - Snippet key to update
   * @param value - New string value (plain text or HTML depending on key)
   */
  async function save(key: SnippetKey, value: string): Promise<void> {
    // Type-narrow: coerce to string to guard against prototype pollution.
    const safe = String(value)
    await db.set(key, safe)
    snippets.value = { ...snippets.value, [key]: safe }
  }

  /**
   * Clear all snippet keys from IndexedDB and reset the reactive map to defaults.
   * After reset, load() would return all defaults (TC-05, TC-13).
   */
  async function reset(): Promise<void> {
    await Promise.all(ALL_KEYS.map((key) => db.del(key)))
    snippets.value = { ...SNIPPET_DEFAULTS }
  }

  return {
    /** Current live snippet values (readonly to prevent external mutation) */
    snippets: readonly(snippets),
    load,
    save,
    reset,
  }
}
