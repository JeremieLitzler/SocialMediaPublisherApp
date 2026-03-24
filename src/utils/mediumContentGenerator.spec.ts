import { describe, it, expect } from 'vitest'
import { generateMediumContent } from './mediumContentGenerator'
import { SNIPPET_DEFAULTS } from '@/config/snippets'
import type { Article } from '@/types/article'

const baseArticle: Article = {
  url: 'https://iamjeremie.me/2024/01/test-article',
  blog: 'english',
  title: 'Test Article',
  description: 'A test description',
  imageUrl: 'https://iamjeremie.me/images/test.jpg',
  imageAlt: 'A test image',
  imageCaption: null,
  introduction: '<p>Introduction paragraph.</p>',
  category: 'Technology',
  tags: ['vue', 'typescript'],
  followMeSnippet: '<p>Follow me!</p>',
  imageCreditSnippet: null,
}

describe('generateMediumContent', () => {
  it('returns correct title, description, imageAlt, canonicalUrl, category, tags', () => {
    const result = generateMediumContent(baseArticle)
    expect(result.title).toBe('Test Article')
    expect(result.description).toBe('A test description')
    expect(result.imageAlt).toBe('A test image')
    expect(result.canonicalUrl).toBe(baseArticle.url)
    expect(result.category).toBe('Technology')
    expect(result.tags).toEqual(['vue', 'typescript'])
  })

  it('returns empty imageCaption when imageCreditSnippet is null', () => {
    const result = generateMediumContent(baseArticle)
    expect(result.imageCaption).toBe('')
  })

  it('returns plain-text imageCaption when imageCreditSnippet is provided', () => {
    const article: Article = { ...baseArticle, imageCreditSnippet: '<p>Photo by Alice</p>' }
    const result = generateMediumContent(article)
    expect(result.imageCaption).toBe('Photo by Alice')
  })

  it('bodyHtml contains figure, introduction, UTM link, followMeSnippet, and why block', () => {
    const result = generateMediumContent(baseArticle, SNIPPET_DEFAULTS)
    expect(result.bodyHtml).toContain('<figure>')
    expect(result.bodyHtml).toContain('<img src="https://iamjeremie.me/images/test.jpg"')
    expect(result.bodyHtml).toContain('<p>Introduction paragraph.</p>')
    expect(result.bodyHtml).toContain('utm_medium=social&utm_source=Medium')
    expect(result.bodyHtml).toContain('⬇️⬇️⬇️')
    expect(result.bodyHtml).toContain('<p>Follow me!</p>')
    expect(result.bodyHtml).toContain(SNIPPET_DEFAULTS.EN_WHY_HEADING)
  })

  it('bodyHtml contains figcaption when imageCreditSnippet is provided', () => {
    const article: Article = { ...baseArticle, imageCreditSnippet: '<p>Photo by Alice</p>' }
    const result = generateMediumContent(article)
    expect(result.bodyHtml).toContain('<figcaption>Photo by Alice</figcaption>')
  })
})
