import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useArticleExtractor } from './useArticleExtractor'
import { useArticleState } from './useArticleState'

// example-ko.html cleaned per CLAUDE.md fixture rules: section headings are <h3>,
// so there is NO <h2> inside .article-content (the reported issue-112 case).
import frenchNoH2Html from '../../tests/fixtures/french-no-h2.html?raw'
// Well-formed article with intro paragraphs followed by a first <h2>.
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

  // TC-1 — article whose section headings are <h3> enters the missing-introduction state
  it('enters missing-introduction (no platform content) for an <h3>-only article', async () => {
    const { extractionState } = useArticleState()
    const { extractArticle } = useArticleExtractor()
    mockFetchHtml(frenchNoH2Html)

    await extractArticle(FRENCH_URL)

    expect(extractionState.value.status).toBe('missing-introduction')
    expect(extractionState.value.article).toBeNull()
  })

  // TC-2 — the message names the true cause and drops the false "no paragraphs" claim
  it('shows a message that names the missing <h2> cause and not a missing-paragraphs claim', async () => {
    const { extractionState } = useArticleState()
    const { extractArticle } = useArticleExtractor()
    mockFetchHtml(frenchNoH2Html)

    await extractArticle(FRENCH_URL)

    const error = extractionState.value.error ?? ''
    expect(error).toContain('<h2>')
    expect(error).toContain('section heading')
    expect(error).not.toMatch(/paragraph/i)
    expect(error).not.toContain('must have')
  })

  // TC-3 — missing .article-content container yields the same state and an accurate message
  it('uses the same state and message when .article-content is absent', async () => {
    const { extractionState } = useArticleState()
    const { extractArticle } = useArticleExtractor()
    mockFetchHtml('<html><body><main>Not a recognized article</main></body></html>')

    await extractArticle(ENGLISH_URL)

    expect(extractionState.value.status).toBe('missing-introduction')
    const error = extractionState.value.error ?? ''
    expect(error).not.toMatch(/paragraph/i)
    expect(error).toContain('<h2>')
  })

  // TC-5 — article with a proper <h2> after intro paragraphs still succeeds
  it('still succeeds for an article with intro paragraphs before the first <h2>', async () => {
    const { extractionState } = useArticleState()
    const { extractArticle } = useArticleExtractor()
    mockFetchHtml(englishWithIntroHtml)

    await extractArticle(ENGLISH_URL)

    expect(extractionState.value.status).toBe('success')
    expect(extractionState.value.article?.introduction).toBeTruthy()
  })

  // TC-6 — article whose .article-content begins with an <h2> (no preceding intro) is unchanged
  it('succeeds with an empty introduction when .article-content begins with an <h2>', async () => {
    const { extractionState } = useArticleState()
    const { extractArticle } = useArticleExtractor()
    mockFetchHtml(
      '<html><body><section class="article-content"><h2>First heading</h2><p>Body</p></section></body></html>',
    )

    await extractArticle(ENGLISH_URL)

    expect(extractionState.value.status).toBe('success')
    expect(extractionState.value.article?.introduction).toBe('')
  })
})
