import { describe, it, expect } from 'vitest'
import { generateXContent } from './xContentGenerator'
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

describe('generateXContent', () => {
  it('returns empty chunks for empty introduction', () => {
    const article: Article = { ...baseArticle, introduction: '' }
    const result = generateXContent(article)
    expect(result.chunks).toEqual([])
  })

  it('produces chunks with text from introduction paragraphs', () => {
    const result = generateXContent(baseArticle)
    expect(result.chunks.length).toBeGreaterThan(0)
    const allText = result.chunks.map((chunk) => chunk.text).join(' ')
    expect(allText).toContain('First paragraph.')
    expect(allText).toContain('Second paragraph.')
  })

  it('last chunk contains UTM link and triple arrow', () => {
    const result = generateXContent(baseArticle)
    const lastChunk = result.chunks.at(-1)
    expect(lastChunk).toBeDefined()
    expect(lastChunk!.text).toContain('⬇️⬇️⬇️')
    expect(lastChunk!.text).toContain('utm_medium=social&utm_source=X')
  })

  it('non-last chunks contain single down-arrow separator', () => {
    const article: Article = {
      ...baseArticle,
      introduction: '<p>First paragraph.</p><p>Second paragraph.</p>',
    }
    const result = generateXContent(article)
    if (result.chunks.length > 1) {
      const firstChunk = result.chunks[0]
      expect(firstChunk.text).toContain('\n\n⬇️')
      expect(firstChunk.text).not.toContain('⬇️⬇️⬇️')
    }
  })

  it('marks oversized chunk when paragraph exceeds 280 chars with no sentence boundary', () => {
    const longText = 'a'.repeat(300)
    const article: Article = {
      ...baseArticle,
      introduction: `<p>${longText}</p>`,
    }
    const result = generateXContent(article)
    expect(result.chunks.length).toBe(1)
    expect(result.chunks[0].oversized).toBe(true)
  })
})
