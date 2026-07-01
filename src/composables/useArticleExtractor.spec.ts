import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useArticleExtractor } from './useArticleExtractor'
import { useArticleState } from './useArticleState'

// NO_HEADING — section headings are <h3>, so there is no <h2> in .article-content.
import frenchNoH2Html from '../../tests/fixtures/french-no-h2.html?raw'
// EMPTY — .article-content begins with a first <h2>, so no introduction precedes it.
import englishNoIntroHtml from '../../tests/fixtures/english-no-intro.html?raw'
// Well-formed article with intro elements before a first <h2>.
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

describe('useArticleExtractor — issue #125 missing-introduction fallback', () => {
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

  // TC-1 — an empty introduction keeps the article's other data instead of discarding it
  it('TC-1: retains the article on an empty introduction', async () => {
    const state = await extractAndReadState(englishNoIntroHtml, ENGLISH_URL)

    expect(state.value.status).toBe('missing-introduction')
    expect(state.value.article).not.toBeNull()
    expect(state.value.article?.title).toBe('CSS Variables')
    expect(state.value.article?.category).not.toBe('')
    expect(state.value.article?.tags.length).toBe(2)
    expect(state.value.article?.introduction).toBe('')
  })

  // TC-1 — the empty-introduction cause message invites manual entry (R3)
  it('TC-1: the empty-introduction message invites manual entry', async () => {
    const state = await extractAndReadState(englishNoIntroHtml, ENGLISH_URL)

    const error = state.value.error ?? ''
    expect(error).toContain('no introduction')
    expect(error).toContain('manually')
  })

  // TC-3 — no <h2> discards the article and instructs a source fix, no manual-entry offer (R4)
  it('TC-3: discards the article and instructs a source fix when there is no <h2>', async () => {
    const state = await extractAndReadState(frenchNoH2Html, FRENCH_URL)

    expect(state.value.status).toBe('missing-introduction')
    expect(state.value.article).toBeNull()
    const error = state.value.error ?? ''
    expect(error).toContain('<h2>')
    expect(error).toContain('cannot be located')
    expect(error).not.toContain('manually')
  })

  // TC-13 — a normal article still extracts successfully with an introduction
  it('TC-13: a normal article extracts successfully with an introduction', async () => {
    const state = await extractAndReadState(englishWithIntroHtml, ENGLISH_URL)

    expect(state.value.status).toBe('success')
    expect(state.value.article?.introduction).toBeTruthy()
  })
})
