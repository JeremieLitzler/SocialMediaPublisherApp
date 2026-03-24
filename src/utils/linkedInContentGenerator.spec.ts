import { describe, it, expect } from 'vitest'
import { generateLinkedInContent } from './linkedInContentGenerator'
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

describe('generateLinkedInContent', () => {
  it('body contains introduction paragraphs separated by double newlines', () => {
    const result = generateLinkedInContent(baseArticle)
    expect(result.body).toContain('First paragraph.')
    expect(result.body).toContain('Second paragraph.')
    expect(result.body).toContain('First paragraph.\n\nSecond paragraph.')
  })

  it('body contains visual separator from shared constant', () => {
    const result = generateLinkedInContent(baseArticle)
    expect(result.body).toContain('⬇️⬇️⬇️')
  })

  it('body contains UTM-tagged link', () => {
    const result = generateLinkedInContent(baseArticle)
    expect(result.body).toContain('utm_medium=social&utm_source=LinkedIn')
  })

  it('body ends with the UTM link after the separator', () => {
    const result = generateLinkedInContent(baseArticle)
    const lines = result.body.split('\n')
    const lastLine = lines.at(-1)
    expect(lastLine).toContain('utm_source=LinkedIn')
  })
})
