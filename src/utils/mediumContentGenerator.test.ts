import { describe, it, expect } from 'vitest'
import { generateMediumContent } from './mediumContentGenerator'
import { generateUTMLink } from './utm'
import type { Article } from '@/types/article'

/**
 * Minimal Article fixture.
 * Provide overrides for the fields under test; all others default to safe values.
 */
function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    url: 'https://iamjeremie.me/article/hello/',
    blog: 'english',
    title: 'Test Title',
    description: 'Test description',
    imageUrl: 'https://iamjeremie.me/img/hero.jpg',
    imageAlt: 'A hero image',
    imageCaption: null,
    introduction: '<p>Intro paragraph.</p>',
    category: 'Technology',
    tags: ['vue', 'typescript'],
    followMeSnippet: '<p>Follow me on socials.</p>',
    imageCreditSnippet: null,
    ...overrides,
  }
}

describe('generateMediumContent', () => {
  describe('direct field mappings', () => {
    it('title is mapped from article.title', () => {
      const article = makeArticle({ title: 'My Article Title' })
      const result = generateMediumContent(article)
      expect(result.title).toBe('My Article Title')
    })

    it('description is mapped from article.description', () => {
      const article = makeArticle({ description: 'A great description' })
      const result = generateMediumContent(article)
      expect(result.description).toBe('A great description')
    })

    it('imageAlt is mapped from article.imageAlt', () => {
      const article = makeArticle({ imageAlt: 'Alt text for image' })
      const result = generateMediumContent(article)
      expect(result.imageAlt).toBe('Alt text for image')
    })

    it('canonicalUrl is article.url without UTM tags', () => {
      const article = makeArticle({ url: 'https://iamjeremie.me/post/test/' })
      const result = generateMediumContent(article)
      expect(result.canonicalUrl).toBe('https://iamjeremie.me/post/test/')
      expect(result.canonicalUrl).not.toContain('utm_')
    })

    it('tags array is passed through unchanged', () => {
      const tags = ['vue', 'typescript', 'webdev']
      const article = makeArticle({ tags })
      const result = generateMediumContent(article)
      expect(result.tags).toEqual(tags)
    })

    it('category is mapped from article.category', () => {
      const article = makeArticle({ category: 'Development' })
      const result = generateMediumContent(article)
      expect(result.category).toBe('Development')
    })
  })

  describe('imageCaption', () => {
    it('imageCaption is empty string when imageCreditSnippet is null', () => {
      const article = makeArticle({ imageCreditSnippet: null })
      const result = generateMediumContent(article)
      expect(result.imageCaption).toBe('')
    })

    it('imageCaption strips HTML tags from imageCreditSnippet', () => {
      const article = makeArticle({
        imageCreditSnippet: '<p>Photo by <a href="https://unsplash.com">John</a> on Unsplash</p>',
      })
      const result = generateMediumContent(article)
      expect(result.imageCaption).toBe('Photo by John on Unsplash')
    })

    it('imageCaption is plain text (no angle brackets)', () => {
      const article = makeArticle({
        imageCreditSnippet: '<p>Photo by <strong>Jane Doe</strong></p>',
      })
      const result = generateMediumContent(article)
      expect(result.imageCaption).not.toContain('<')
      expect(result.imageCaption).not.toContain('>')
    })
  })

  describe('bodyHtml — figure block', () => {
    it('bodyHtml contains <img> with correct src', () => {
      const article = makeArticle({ imageUrl: 'https://iamjeremie.me/img/photo.jpg' })
      const result = generateMediumContent(article)
      expect(result.bodyHtml).toContain('src="https://iamjeremie.me/img/photo.jpg"')
    })

    it('bodyHtml contains <img> with correct alt', () => {
      const article = makeArticle({ imageAlt: 'Beautiful sunset' })
      const result = generateMediumContent(article)
      expect(result.bodyHtml).toContain('alt="Beautiful sunset"')
    })

    it('bodyHtml contains <figcaption> when imageCreditSnippet is present', () => {
      const article = makeArticle({
        imageCreditSnippet: '<p>Photo by Jane</p>',
      })
      const result = generateMediumContent(article)
      expect(result.bodyHtml).toContain('<figcaption>')
      expect(result.bodyHtml).toContain('Photo by Jane')
    })

    it('bodyHtml omits <figcaption> when imageCreditSnippet is null', () => {
      const article = makeArticle({ imageCreditSnippet: null })
      const result = generateMediumContent(article)
      expect(result.bodyHtml).not.toContain('<figcaption>')
    })
  })

  describe('bodyHtml — introduction', () => {
    it('bodyHtml contains introduction HTML verbatim', () => {
      const intro = '<p>First paragraph.</p><p>Second paragraph.</p>'
      const article = makeArticle({ introduction: intro })
      const result = generateMediumContent(article)
      expect(result.bodyHtml).toContain(intro)
    })
  })

  describe('bodyHtml — UTM link', () => {
    it('bodyHtml contains UTM link with utm_source=Medium', () => {
      const article = makeArticle({ url: 'https://iamjeremie.me/post/hello/' })
      const result = generateMediumContent(article)
      expect(result.bodyHtml).toContain('utm_source=Medium')
    })

    it('bodyHtml UTM link matches generateUTMLink output', () => {
      const url = 'https://iamjeremie.me/post/hello/'
      const article = makeArticle({ url })
      const expectedLink = generateUTMLink(url, 'Medium')
      const result = generateMediumContent(article)
      expect(result.bodyHtml).toContain(expectedLink)
    })
  })

  describe('bodyHtml — followMeSnippet', () => {
    it('bodyHtml contains followMeSnippet verbatim', () => {
      const snippet = '<p>Follow me on <a href="https://twitter.com/foo">Twitter</a>.</p>'
      const article = makeArticle({ followMeSnippet: snippet })
      const result = generateMediumContent(article)
      expect(result.bodyHtml).toContain(snippet)
    })
  })

  describe('bodyHtml — Why snippet', () => {
    it('bodyHtml contains EN "Why" heading for English article', () => {
      const article = makeArticle({ blog: 'english' })
      const result = generateMediumContent(article)
      expect(result.bodyHtml).toContain('Why does this post link to my blog?')
    })

    it('bodyHtml contains FR "Why" heading for French article', () => {
      const article = makeArticle({ blog: 'french' })
      const result = generateMediumContent(article)
      expect(result.bodyHtml).toContain('Pourquoi ce billet renvoie-t-il à mon blog ?')
    })

    it('bodyHtml does not contain FR heading for English article', () => {
      const article = makeArticle({ blog: 'english' })
      const result = generateMediumContent(article)
      expect(result.bodyHtml).not.toContain('Pourquoi ce billet renvoie-t-il')
    })
  })
})
