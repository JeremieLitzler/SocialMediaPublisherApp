import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useArticleExtractor } from './useArticleExtractor'
import { useArticleState } from './useArticleState'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Load fixtures once
const fixturesPath = join(process.cwd(), 'tests', 'fixtures')
const englishWithIntroHTML = readFileSync(join(fixturesPath, 'english-with-intro.html'), 'utf-8')
const frenchWithIntroHTML = readFileSync(join(fixturesPath, 'french-with-intro.html'), 'utf-8')
const englishNoCreditHTML = readFileSync(join(fixturesPath, 'english-no-credit.html'), 'utf-8')

describe('useArticleExtractor', () => {
  beforeEach(() => {
    // Reset state before each test
    const { extractionState } = useArticleState()
    extractionState.value = {
      status: 'idle',
      article: null,
      error: null,
      manualIntroduction: '',
    }
  })

  afterEach(() => {
    // Clear any fetch mocks after each test
    vi.unstubAllGlobals()
  })

  describe('extractArticle', () => {
    it('should set loading state initially', async () => {
      const { extractionState } = useArticleState()
      const { extractArticle } = useArticleExtractor()

      // vi.stubGlobal replaces a global variable (like fetch) with a mock implementation
      // This is the recommended way to mock globals in Vitest, avoiding TypeScript issues
      // Documentation: https://vitest.dev/api/vi.html#vi-stubglobal
      // Mock Netlify Function response format
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, html: englishWithIntroHTML }),
        })
      ))

      const promise = extractArticle('https://iamjeremie.me/post/2026-01/test/')

      // Check loading state immediately
      expect(extractionState.value.status).toBe('loading')

      await promise
    })

    it('should extract article successfully from English blog', async () => {
      const { extractionState } = useArticleState()
      const { extractArticle } = useArticleExtractor()

      // Mock Netlify Function response format
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, html: englishWithIntroHTML }),
        })
      ))

      await extractArticle('https://iamjeremie.me/post/2026-01/test/')

      expect(extractionState.value.status).toBe('success')
      expect(extractionState.value.article).toBeTruthy()
      expect(extractionState.value.article?.blog).toBe('english')
      expect(extractionState.value.article?.title).toBeTruthy()
      expect(extractionState.value.article?.introduction).toBeTruthy()
      expect(extractionState.value.error).toBeNull()
    })

    it('should extract article successfully from French blog', async () => {
      const { extractionState } = useArticleState()
      const { extractArticle } = useArticleExtractor()

      // Mock Netlify Function response format
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, html: frenchWithIntroHTML }),
        })
      ))

      await extractArticle('https://jeremielitzler.fr/post/2026-01/test/')

      expect(extractionState.value.status).toBe('success')
      expect(extractionState.value.article).toBeTruthy()
      expect(extractionState.value.article?.blog).toBe('french')
      expect(extractionState.value.article?.title).toBeTruthy()
      expect(extractionState.value.article?.introduction).toBeTruthy()
      expect(extractionState.value.error).toBeNull()
    })

    it('should handle missing introduction by removing all h2 tags', async () => {
      const { extractionState } = useArticleState()
      const { extractArticle } = useArticleExtractor()

      // Remove all h2 tags from the HTML to simulate missing introduction
      const htmlWithoutH2 = englishWithIntroHTML.replace(/<h2[^>]*>.*?<\/h2>/gs, '')

      // Mock Netlify Function response format
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, html: htmlWithoutH2 }),
        })
      ))

      await extractArticle('https://iamjeremie.me/post/2026-01/test/')

      expect(extractionState.value.status).toBe('missing-introduction')
      expect(extractionState.value.article).toBeNull()
      expect(extractionState.value.error).toContain('No introduction found')
    })

    it('should extract article without image credit', async () => {
      const { extractionState } = useArticleState()
      const { extractArticle } = useArticleExtractor()

      // Mock Netlify Function response format
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, html: englishNoCreditHTML }),
        })
      ))

      await extractArticle('https://iamjeremie.me/post/2025-12/test/')

      expect(extractionState.value.status).toBe('success')
      expect(extractionState.value.article).toBeTruthy()
      expect(extractionState.value.article?.imageCreditSnippet).toBeNull()
    })

    it('should handle HTTP errors', async () => {
      const { extractionState } = useArticleState()
      const { extractArticle } = useArticleExtractor()

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        })
      ))

      await extractArticle('https://example.com/not-found')

      expect(extractionState.value.status).toBe('error')
      expect(extractionState.value.article).toBeNull()
      expect(extractionState.value.error).toContain('404')
    })

    it('should handle network errors', async () => {
      const { extractionState } = useArticleState()
      const { extractArticle } = useArticleExtractor()

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.reject(new Error('Network error'))
      ))

      await extractArticle('https://example.com/article')

      expect(extractionState.value.status).toBe('error')
      expect(extractionState.value.article).toBeNull()
      expect(extractionState.value.error).toBe('Network error')
    })

    it('should handle CORS errors', async () => {
      const { extractionState } = useArticleState()
      const { extractArticle } = useArticleExtractor()

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.reject(new TypeError('Failed to fetch'))
      ))

      await extractArticle('https://example.com/article')

      expect(extractionState.value.status).toBe('error')
      expect(extractionState.value.article).toBeNull()
      expect(extractionState.value.error).toBe('Failed to fetch')
    })

    it('should reset state on new extraction', async () => {
      const { extractionState } = useArticleState()
      const { extractArticle } = useArticleExtractor()

      // Set some previous state
      extractionState.value = {
        status: 'success',
        article: {} as any,
        error: null,
        manualIntroduction: 'some text',
      }

      // Mock Netlify Function response format
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, html: englishWithIntroHTML }),
        })
      ))

      await extractArticle('https://iamjeremie.me/post/2026-01/test/')

      // State should be reset
      expect(extractionState.value.manualIntroduction).toBe('')
    })

    it('should extract all article fields correctly', async () => {
      const { extractionState } = useArticleState()
      const { extractArticle } = useArticleExtractor()

      // Mock Netlify Function response format
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, html: englishWithIntroHTML }),
        })
      ))

      const testUrl = 'https://iamjeremie.me/post/2026-01/test/'
      await extractArticle(testUrl)

      const article = extractionState.value.article
      expect(article).toBeTruthy()
      expect(article?.url).toBe(testUrl)
      expect(article?.blog).toBe('english')
      expect(article?.title).toBeTruthy()
      expect(article?.description).toBeTruthy()
      expect(article?.imageUrl).toBeTruthy()
      expect(article?.imageAlt).toBeTruthy()
      expect(article?.imageCaption).toBeNull() // Not extracted from HTML
      expect(article?.introduction).toBeTruthy()
      expect(article?.category).toBeTruthy()
      expect(Array.isArray(article?.tags)).toBe(true)
      expect(article?.followMeSnippet).toBeTruthy()
      expect(article?.imageCreditSnippet).toBeTruthy() // This fixture has image credit
    })
  })
})
