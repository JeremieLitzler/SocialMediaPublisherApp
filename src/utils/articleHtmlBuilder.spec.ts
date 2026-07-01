import { describe, it, expect } from 'vitest'
import { VISUAL_SEPARATOR, buildFigcaption, buildFigureHtml } from './articleHtmlBuilder'
import type { Article } from '@/types/article'

const baseArticle: Article = {
  url: 'https://iamjeremie.me/2024/01/test-article',
  blog: 'english',
  title: 'Test Article',
  description: 'A test description',
  imageUrl: 'https://iamjeremie.me/images/test.jpg',
  imageAlt: 'A test image',
  imageCaption: null,
  introduction: '<p>First paragraph.</p><p>Second paragraph.</p>',
  category: 'Technology',
  tags: ['vue', 'typescript'],
  followMeSnippet: '<p>Follow me!</p>',
  imageCreditSnippet: null,
}

describe('VISUAL_SEPARATOR', () => {
  it('is the correct emoji string', () => {
    expect(VISUAL_SEPARATOR).toBe('⬇️⬇️⬇️')
  })
})

describe('buildFigcaption', () => {
  it('returns empty string when imageCreditSnippet is null', () => {
    expect(buildFigcaption(null)).toBe('')
  })

  it('returns figcaption with plain text when imageCreditSnippet is provided', () => {
    const result = buildFigcaption('<p>Photo by Alice</p>')
    expect(result).toBe('<figcaption>Photo by Alice</figcaption>')
  })
})

describe('buildFigureHtml', () => {
  it('returns figure with img and no figcaption when imageCreditSnippet is null', () => {
    const result = buildFigureHtml(baseArticle)
    expect(result).toBe(
      `<figure><img src="${baseArticle.imageUrl}" alt="${baseArticle.imageAlt}" /></figure>`,
    )
    expect(result).not.toContain('<figcaption>')
  })

  it('returns figure with img and figcaption when imageCreditSnippet is provided', () => {
    const article: Article = { ...baseArticle, imageCreditSnippet: '<p>Photo by Alice</p>' }
    const result = buildFigureHtml(article)
    expect(result).toContain('<figcaption>Photo by Alice</figcaption>')
    expect(result).toContain(`<img src="${article.imageUrl}" alt="${article.imageAlt}" />`)
    expect(result).toMatch(/^<figure>/)
    expect(result).toMatch(/<\/figure>$/)
  })
})
