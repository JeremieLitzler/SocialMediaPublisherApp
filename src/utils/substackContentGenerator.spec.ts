import { describe, it, expect } from 'vitest'
import { generateSubstackContent } from './substackContentGenerator'
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

describe('generateSubstackContent', () => {
  it('returns correct title, description, category, tags', () => {
    const result = generateSubstackContent(baseArticle)
    expect(result.title).toBe('Test Article')
    expect(result.description).toBe('A test description')
    expect(result.category).toBe('Technology')
    expect(result.tags).toEqual(['vue', 'typescript'])
  })

  it('bodyHtml contains figure with img', () => {
    const result = generateSubstackContent(baseArticle)
    expect(result.bodyHtml).toContain('<figure>')
    expect(result.bodyHtml).toContain('<img src="https://iamjeremie.me/images/test.jpg"')
  })

  it('bodyHtml contains introduction', () => {
    const result = generateSubstackContent(baseArticle)
    expect(result.bodyHtml).toContain('<p>Introduction paragraph.</p>')
  })

  it('bodyHtml contains visual separator and UTM link', () => {
    const result = generateSubstackContent(baseArticle)
    expect(result.bodyHtml).toContain('⬇️⬇️⬇️')
    expect(result.bodyHtml).toContain('utm_medium=social&utm_source=Substack')
  })

  it('bodyHtml contains attribution block for english blog', () => {
    const result = generateSubstackContent(baseArticle)
    expect(result.bodyHtml).toContain('Originally published on')
    expect(result.bodyHtml).toContain('iamjeremie.me')
  })

  it('bodyHtml contains attribution block for french blog', () => {
    const article: Article = { ...baseArticle, url: 'https://jeremielitzler.fr/2024/01/test', blog: 'french' }
    const result = generateSubstackContent(article)
    expect(result.bodyHtml).toContain('Originalement publiée sur')
    expect(result.bodyHtml).toContain('jeremielitzler.fr')
  })

  it('bodyHtml contains share block from default snippets', () => {
    const result = generateSubstackContent(baseArticle, SNIPPET_DEFAULTS)
    expect(result.bodyHtml).toContain(SNIPPET_DEFAULTS.EN_SUBSTACK_SHARE_BLOCK)
  })

  it('bodyHtml contains figcaption when imageCreditSnippet is provided', () => {
    const article: Article = { ...baseArticle, imageCreditSnippet: '<p>Photo by Alice</p>' }
    const result = generateSubstackContent(article)
    expect(result.bodyHtml).toContain('<figcaption>Photo by Alice</figcaption>')
  })
})
