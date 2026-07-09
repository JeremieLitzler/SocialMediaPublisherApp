/**
 * Issue #132 — TC-8: custom Medium anchor persists per key without affecting others.
 *
 * The module-level singleton snippets ref is shared, so reset() runs before each
 * test to guarantee a clean baseline.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useSnippets } from './useSnippets'
import { SNIPPET_DEFAULTS } from '@/config/snippets'

describe('useSnippets — Medium anchor per-key persistence (TC-8)', () => {
  beforeEach(async () => {
    const { reset } = useSnippets()
    await reset()
  })

  it('saving the French Medium anchor leaves every other snippet unchanged', async () => {
    const { snippets, save } = useSnippets()
    await save('FR_MEDIUM_UTM_ANCHOR', 'Lire la suite ici')

    expect(snippets.value.FR_MEDIUM_UTM_ANCHOR).toBe('Lire la suite ici')
    expect(snippets.value.EN_MEDIUM_UTM_ANCHOR).toBe(SNIPPET_DEFAULTS.EN_MEDIUM_UTM_ANCHOR)
    expect(snippets.value.FR_SUBSTACK_UTM_ANCHOR).toBe(SNIPPET_DEFAULTS.FR_SUBSTACK_UTM_ANCHOR)
    expect(snippets.value.EN_SUBSTACK_UTM_ANCHOR).toBe(SNIPPET_DEFAULTS.EN_SUBSTACK_UTM_ANCHOR)
    expect(snippets.value.FR_WHY_HEADING).toBe(SNIPPET_DEFAULTS.FR_WHY_HEADING)
    expect(snippets.value.EN_WHY_BODY_HTML).toBe(SNIPPET_DEFAULTS.EN_WHY_BODY_HTML)
  })

  it('a saved French Medium anchor survives a reload from IndexedDB', async () => {
    const { snippets, save, load } = useSnippets()
    await save('FR_MEDIUM_UTM_ANCHOR', 'Lire la suite ici')
    await load()
    expect(snippets.value.FR_MEDIUM_UTM_ANCHOR).toBe('Lire la suite ici')
    expect(snippets.value.EN_MEDIUM_UTM_ANCHOR).toBe(SNIPPET_DEFAULTS.EN_MEDIUM_UTM_ANCHOR)
  })
})
