import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useArticleExtractor } from './useArticleExtractor'
import { useArticleState } from './useArticleState'

// Cause A — section headings are <h3>, so there is NO <h2> inside .article-content.
import frenchNoH2Html from '../../tests/fixtures/french-no-h2.html?raw'
// Cause B — .article-content begins with an <h2>, so no introduction precedes it.
import englishNoIntroHtml from '../../tests/fixtures/english-no-intro.html?raw'
// Well-formed article with intro elements followed by a first <h2>.
import englishWithIntroHtml from '../../tests/fixtures/english-with-intro.html?raw'

const FRENCH_URL = 'https://jeremielitzler.fr/post/2025-10/composition-vs-aggregation-vs-association/'
const ENGLISH_URL = 'https://iamjeremie.me/post/2026-01/test/'

function mockFetchHtml(html: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, html }),
      }),
    ),
  )
}

async function extractAndReadState(html: string, url: string) {
  const { extractionState } = useArticleState()
  const { extractArticle } = useArticleExtractor()
  mockFetchHtml(html)
  await extractArticle(url)
  return extractionState
}

describe('useArticleExtractor — issue #112 missing-introduction messaging', () => {
  beforeEach(() => {
    const { extractionState } = useArticleState()
    extractionState.value = {
      status: 'idle',
      article: null,
      error: null,
      manualIntroduction: '',
      selectedPlatform: null,
    }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // TC-1 — <h3>-only article enters the missing-introduction state, no platform content
  it('enters missing-introduction for an <h3>-only article', async () => {
    const state = await extractAndReadState(frenchNoH2Html, FRENCH_URL)

    expect(state.value.status).toBe('missing-introduction')
    expect(state.value.article).toBeNull()
  })

  // TC-2 — the no-<h2> message names that cause and makes no missing-paragraphs claim
  it('names the missing-<h2> cause and not a missing-paragraphs claim', async () => {
    const state = await extractAndReadState(frenchNoH2Html, FRENCH_URL)

    const error = state.value.error ?? ''
    expect(error).toContain('<h2>')
    expect(error).toContain('cannot be located')
    expect(error).not.toMatch(/paragraph/i)
    expect(error).not.toContain('must have')
  })

  // TC-3 — missing .article-content container reuses the same state and no-<h2> message
  it('reuses the no-<h2> message when .article-content is absent', async () => {
    const state = await extractAndReadState(
      '<html><body><main>Not a recognized article</main></body></html>',
      ENGLISH_URL,
    )

    expect(state.value.status).toBe('missing-introduction')
    const error = state.value.error ?? ''
    expect(error).toContain('cannot be located')
    expect(error).not.toMatch(/paragraph/i)
  })

  // TC-4 — first <h2> with no introduction before it enters the missing-introduction state
  it('enters missing-introduction when a first <h2> has no introduction before it', async () => {
    const state = await extractAndReadState(englishNoIntroHtml, ENGLISH_URL)

    expect(state.value.status).toBe('missing-introduction')
    expect(state.value.article).toBeNull()
  })

  // TC-5 — the empty-introduction message names its own cause and differs from the no-<h2> one
  it('shows a distinct empty-introduction message that invites adding an introduction', async () => {
    const noHeadingState = await extractAndReadState(frenchNoH2Html, FRENCH_URL)
    const noHeadingMessage = noHeadingState.value.error ?? ''

    const emptyState = await extractAndReadState(englishNoIntroHtml, ENGLISH_URL)
    const emptyMessage = emptyState.value.error ?? ''

    expect(emptyMessage).toContain('no introduction')
    expect(emptyMessage).toContain('manually')
    expect(emptyMessage).not.toBe(noHeadingMessage)
  })

  // TC-7 — article with intro elements before a first <h2> still succeeds
  it('still succeeds for an article with intro content before the first <h2>', async () => {
    const state = await extractAndReadState(englishWithIntroHtml, ENGLISH_URL)

    expect(state.value.status).toBe('success')
    expect(state.value.article?.introduction).toBeTruthy()
  })
})
