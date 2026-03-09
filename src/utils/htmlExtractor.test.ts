import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { JSDOM } from 'jsdom'
import {
  extractTitle,
  extractDescription,
  extractImageUrl,
  extractImageAlt,
  extractIntroduction,
  extractCategories,
  extractTags,
  extractFollowMeSnippet,
  extractImageCredit,
  detectBlog,
} from './htmlExtractor'

describe('htmlExtractor', () => {
  let englishWithIntroDoc: Document
  let frenchWithIntroDoc: Document
  let englishNoCreditDoc: Document
  let frenchNoCreditDoc: Document
  let englishNoH2Doc: Document

  beforeAll(() => {
    // Load real HTML fixtures
    const fixturesPath = join(process.cwd(), 'tests', 'fixtures')

    const englishWithIntroHtml = readFileSync(
      join(fixturesPath, 'english-with-intro.html'),
      'utf-8'
    )
    englishWithIntroDoc = new JSDOM(englishWithIntroHtml).window.document

    const frenchWithIntroHtml = readFileSync(
      join(fixturesPath, 'french-with-intro.html'),
      'utf-8'
    )
    frenchWithIntroDoc = new JSDOM(frenchWithIntroHtml).window.document

    const englishNoCreditHtml = readFileSync(
      join(fixturesPath, 'english-no-credit.html'),
      'utf-8'
    )
    englishNoCreditDoc = new JSDOM(englishNoCreditHtml).window.document

    const frenchNoCreditHtml = readFileSync(
      join(fixturesPath, 'french-no-credit.html'),
      'utf-8'
    )
    frenchNoCreditDoc = new JSDOM(frenchNoCreditHtml).window.document

    // Create a version without h2 for testing null return
    const htmlWithoutH2 = englishWithIntroHtml.replace(/<h2[^>]*>.*?<\/h2>/gs, '')
    englishNoH2Doc = new JSDOM(htmlWithoutH2).window.document
  })

  describe('extractTitle', () => {
    it('should extract title from English article', () => {
      const title = extractTitle(englishWithIntroDoc)
      expect(title).toBeTruthy()
      expect(title.length).toBeGreaterThan(0)
    })

    it('should extract title from French article', () => {
      const title = extractTitle(frenchWithIntroDoc)
      expect(title).toBeTruthy()
      expect(title.length).toBeGreaterThan(0)
    })

    it('should return empty string when title element is missing', () => {
      const emptyDoc = new JSDOM('<html><body></body></html>').window.document
      expect(extractTitle(emptyDoc)).toBe('')
    })
  })

  describe('extractDescription', () => {
    it('should extract description from English article', () => {
      const description = extractDescription(englishWithIntroDoc)
      expect(description).toBeTruthy()
      expect(description.length).toBeGreaterThan(0)
    })

    it('should extract description from French article', () => {
      const description = extractDescription(frenchWithIntroDoc)
      expect(description).toBeTruthy()
      expect(description.length).toBeGreaterThan(0)
    })

    it('should return empty string when description element is missing', () => {
      const emptyDoc = new JSDOM('<html><body></body></html>').window.document
      expect(extractDescription(emptyDoc)).toBe('')
    })
  })

  describe('extractImageUrl', () => {
    it('should extract absolute image URL from twitter:image meta in English article', () => {
      const imageUrl = extractImageUrl(englishWithIntroDoc)
      expect(imageUrl).toBeTruthy()
      expect(imageUrl).toMatch(/^https?:\/\//)
      expect(imageUrl).toMatch(/\.(jpg|png|webp|gif)$/i)
    })

    it('should extract absolute image URL from twitter:image meta in French article', () => {
      const imageUrl = extractImageUrl(frenchWithIntroDoc)
      expect(imageUrl).toBeTruthy()
      expect(imageUrl).toMatch(/^https?:\/\//)
      expect(imageUrl).toMatch(/\.(jpg|png|webp|gif)$/i)
    })

    it('should return empty string when twitter:image meta is missing', () => {
      const emptyDoc = new JSDOM('<html><body></body></html>').window.document
      expect(extractImageUrl(emptyDoc)).toBe('')
    })
  })

  describe('extractImageAlt', () => {
    it('should extract image alt text from English article via .article-header .article-image a img', () => {
      const imageAlt = extractImageAlt(englishWithIntroDoc)
      expect(imageAlt).toBeTruthy()
      expect(imageAlt.length).toBeGreaterThan(0)
    })

    it('should extract image alt text from French article via .article-header .article-image a img', () => {
      const imageAlt = extractImageAlt(frenchWithIntroDoc)
      expect(imageAlt).toBeTruthy()
      expect(imageAlt.length).toBeGreaterThan(0)
    })

    it('should return empty string when .article-header .article-image a img is missing', () => {
      const emptyDoc = new JSDOM('<html><body></body></html>').window.document
      expect(extractImageAlt(emptyDoc)).toBe('')
    })
  })

  describe('extractIntroduction', () => {
    it('should extract introduction paragraphs from English article', () => {
      const introduction = extractIntroduction(englishWithIntroDoc)
      expect(introduction).toBeTruthy()
      expect(introduction).toContain('<p>')
      expect(introduction).toContain('</p>')
    })

    it('should extract introduction paragraphs from French article', () => {
      const introduction = extractIntroduction(frenchWithIntroDoc)
      expect(introduction).toBeTruthy()
      expect(introduction).toContain('<p>')
      expect(introduction).toContain('</p>')
    })

    it('should return null when no h2 is found', () => {
      const introduction = extractIntroduction(englishNoH2Doc)
      expect(introduction).toBeNull()
    })

    it('should return null when article-content is missing', () => {
      const emptyDoc = new JSDOM('<html><body></body></html>').window.document
      expect(extractIntroduction(emptyDoc)).toBeNull()
    })

    it('should only extract paragraphs before first h2', () => {
      const introduction = extractIntroduction(englishWithIntroDoc)
      expect(introduction).not.toContain('<h2>')
    })

    describe('expanded element types — <pre>, <ul>, <blockquote>', () => {
      function makeDoc(innerHtml: string): Document {
        return new JSDOM(
          `<html><body><section class="article-content">${innerHtml}</section></body></html>`
        ).window.document
      }

      it('extracts a <pre> element before first <h2>', () => {
        const doc = makeDoc('<pre>code block</pre><h2>Section</h2>')
        const result = extractIntroduction(doc)
        expect(result).toContain('<pre>')
        expect(result).toContain('code block')
      })

      it('extracts a <ul> element before first <h2>', () => {
        const doc = makeDoc('<ul><li>item one</li><li>item two</li></ul><h2>Section</h2>')
        const result = extractIntroduction(doc)
        expect(result).toContain('<ul>')
        expect(result).toContain('<li>item one</li>')
      })

      it('extracts a <blockquote> element before first <h2>', () => {
        const doc = makeDoc('<blockquote><p>quoted text</p></blockquote><h2>Section</h2>')
        const result = extractIntroduction(doc)
        expect(result).toContain('<blockquote>')
        expect(result).toContain('quoted text')
      })

      it('preserves source order across mixed element types', () => {
        const doc = makeDoc(
          '<p>First.</p><pre>code</pre><p>Second.</p><ul><li>item</li></ul><h2>Section</h2>'
        )
        const result = extractIntroduction(doc)
        expect(result).not.toBeNull()
        const pIndex = result!.indexOf('<p>First.')
        const preIndex = result!.indexOf('<pre>')
        const p2Index = result!.indexOf('<p>Second.')
        const ulIndex = result!.indexOf('<ul>')
        expect(pIndex).toBeLessThan(preIndex)
        expect(preIndex).toBeLessThan(p2Index)
        expect(p2Index).toBeLessThan(ulIndex)
      })

      it('excludes <pre> that appears after the first <h2>', () => {
        const doc = makeDoc('<p>Intro.</p><h2>Section</h2><pre>body code</pre>')
        const result = extractIntroduction(doc)
        expect(result).not.toContain('<pre>')
        expect(result).toContain('<p>Intro.</p>')
      })

      it('succeeds when introduction contains only a <pre> element', () => {
        const doc = makeDoc('<pre>only code</pre><h2>Section</h2>')
        const result = extractIntroduction(doc)
        expect(result).not.toBeNull()
        expect(result).not.toBe('')
        expect(result).toContain('<pre>')
      })

      it('includes an empty <pre> element verbatim', () => {
        const doc = makeDoc('<pre></pre><h2>Section</h2>')
        const result = extractIntroduction(doc)
        expect(result).toContain('<pre>')
      })

      it('preserves nested HTML inside <pre> (e.g. syntax-highlighted spans)', () => {
        const doc = makeDoc(
          '<pre><span class="kw">const</span> x = 1</pre><h2>Section</h2>'
        )
        const result = extractIntroduction(doc)
        expect(result).toContain('<span class="kw">const</span>')
      })

      it('preserves nested HTML inside <blockquote>', () => {
        const doc = makeDoc('<blockquote><p>nested paragraph</p></blockquote><h2>Section</h2>')
        const result = extractIntroduction(doc)
        expect(result).toContain('<p>nested paragraph</p>')
      })

      it('does not include <ol> elements (not in the allowlist)', () => {
        const doc = makeDoc('<p>Intro.</p><ol><li>ordered</li></ol><h2>Section</h2>')
        const result = extractIntroduction(doc)
        expect(result).not.toContain('<ol>')
        expect(result).toContain('<p>Intro.</p>')
      })

      it('returns null when no <h2> is present even if <pre> exists', () => {
        const doc = makeDoc('<pre>code</pre>')
        expect(extractIntroduction(doc)).toBeNull()
      })
    })
  })

  describe('extractCategories', () => {
    it('should extract categories from English article', () => {
      const categories = extractCategories(englishWithIntroDoc)
      expect(categories).toBeTruthy()
      expect(categories.length).toBeGreaterThan(0)
    })

    it('should extract categories from French article', () => {
      const categories = extractCategories(frenchWithIntroDoc)
      expect(categories).toBeTruthy()
      expect(categories.length).toBeGreaterThan(0)
    })

    it('should return empty string when category header is missing', () => {
      const emptyDoc = new JSDOM('<html><body></body></html>').window.document
      expect(extractCategories(emptyDoc)).toBe('')
    })
  })

  describe('extractTags', () => {
    it('should extract tags array from English article', () => {
      const tags = extractTags(englishWithIntroDoc)
      expect(Array.isArray(tags)).toBe(true)
      expect(tags.length).toBeGreaterThan(0)
    })

    it('should extract tags array from French article', () => {
      const tags = extractTags(frenchWithIntroDoc)
      expect(Array.isArray(tags)).toBe(true)
      expect(tags.length).toBeGreaterThan(0)
    })

    it('should return empty array when tags section is missing', () => {
      const emptyDoc = new JSDOM('<html><body></body></html>').window.document
      expect(extractTags(emptyDoc)).toEqual([])
    })
  })

  describe('extractFollowMeSnippet', () => {
    it('should extract follow-me snippet from English article', () => {
      const snippet = extractFollowMeSnippet(englishWithIntroDoc)
      expect(snippet).toBeTruthy()
      expect(snippet).toContain('<')
    })

    it('should extract follow-me snippet from French article', () => {
      const snippet = extractFollowMeSnippet(frenchWithIntroDoc)
      expect(snippet).toBeTruthy()
      expect(snippet).toContain('<')
    })

    it('should replace the title <p> with <h2> inside jli-notice-tip (English)', () => {
      const snippet = extractFollowMeSnippet(englishWithIntroDoc)
      expect(snippet).toContain('<h2 class="jli-notice-title">')
      expect(snippet).toContain('</h2>')
      expect(snippet).not.toContain('<p class="jli-notice-title">')
    })

    it('should replace the title <p> with <h2> inside jli-notice-tip (French)', () => {
      const snippet = extractFollowMeSnippet(frenchWithIntroDoc)
      expect(snippet).toContain('<h2 class="jli-notice-title">')
      expect(snippet).toContain('</h2>')
      expect(snippet).not.toContain('<p class="jli-notice-title">')
    })

    it('should not modify title <p> for non-tip snippets', () => {
      const doc = new JSDOM(
        '<html><body><section class="article-content"><p>Intro</p><div class="jli-notice jli-notice-note"><p class="jli-notice-title">Note</p></div><p>Credit</p></section></body></html>'
      ).window.document
      const snippet = extractFollowMeSnippet(doc)
      expect(snippet).toContain('<p class="jli-notice-title">')
    })

    it('should return empty string when article-content is missing', () => {
      const emptyDoc = new JSDOM('<html><body></body></html>').window.document
      expect(extractFollowMeSnippet(emptyDoc)).toBe('')
    })

    it('should return empty string when article-content has less than 2 children', () => {
      const doc = new JSDOM(
        '<html><body><section class="article-content"><p>Only one child</p></section></body></html>'
      ).window.document
      expect(extractFollowMeSnippet(doc)).toBe('')
    })
  })

  describe('extractImageCredit', () => {
    it('should extract image credit from English article with "Photo by"', () => {
      const credit = extractImageCredit(englishWithIntroDoc)
      expect(credit).toBeTruthy()
      expect(credit).toMatch(/^Photo by/)
    })

    it('should extract image credit from French article with "Photo de"', () => {
      const credit = extractImageCredit(frenchWithIntroDoc)
      expect(credit).toBeTruthy()
      expect(credit).toMatch(/^Photo de/)
    })

    it('should return null when last paragraph does not start with photo credit', () => {
      const credit = extractImageCredit(englishNoCreditDoc)
      expect(credit).toBeNull()
    })

    it('should return null when article-content is missing', () => {
      const emptyDoc = new JSDOM('<html><body></body></html>').window.document
      expect(extractImageCredit(emptyDoc)).toBeNull()
    })

    it('should return null when no paragraphs exist', () => {
      const doc = new JSDOM(
        '<html><body><section class="article-content"><div>No paragraphs</div></section></body></html>'
      ).window.document
      expect(extractImageCredit(doc)).toBeNull()
    })
  })

  describe('detectBlog', () => {
    it('should detect English blog from iamjeremie.me domain', () => {
      expect(detectBlog('https://iamjeremie.me/post/2026-01/test/')).toBe('english')
      expect(detectBlog('http://iamjeremie.me/some-path')).toBe('english')
    })

    it('should detect French blog from jeremielitzler.fr domain', () => {
      expect(detectBlog('https://jeremielitzler.fr/post/2026-01/test/')).toBe('french')
      expect(detectBlog('http://jeremielitzler.fr/some-path')).toBe('french')
    })

    it('should default to english for unknown domains', () => {
      expect(detectBlog('https://example.com/article')).toBe('english')
      expect(detectBlog('https://other-domain.com')).toBe('english')
    })
  })
})
