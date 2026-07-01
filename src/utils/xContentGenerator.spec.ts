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

/** Build an article with the given introduction HTML, other fields fixed. */
function makeArticle(introduction: string): Article {
  return { ...baseArticle, introduction }
}

describe('generateXContent — block-first chunking', () => {
  // TC-13 Each non-paragraph block is its own chunk
  it('puts a list in its own chunk, never merged into the preceding paragraph', () => {
    const result = generateXContent(
      makeArticle('<p>Lead in.</p><ul><li>Item A</li><li>Item B</li></ul>'),
    )
    expect(result.chunks.length).toBe(2)

    const paragraphChunk = result.chunks.find((chunk) => chunk.text.includes('Lead in.'))
    const listChunk = result.chunks.find((chunk) => chunk.text.includes('- Item A'))

    expect(paragraphChunk).toBeDefined()
    expect(listChunk).toBeDefined()
    expect(paragraphChunk!.text).not.toContain('- Item A')
    expect(listChunk!.text).not.toContain('Lead in.')
    expect(listChunk!.text).toContain('- Item A\n- Item B')
  })

  // TC-14 Oversized block obeys the same length handling as a paragraph
  it('flags an oversized non-paragraph block instead of splitting or dropping it', () => {
    const result = generateXContent(makeArticle(`<pre>${'a'.repeat(300)}</pre>`))
    expect(result.chunks.length).toBe(1)
    expect(result.chunks[0].oversized).toBe(true)
    expect(result.chunks[0].text).toContain('```')
  })

  // TC-16 Block text comes from DOM text, not raw markup
  it('emits readable text only; script content does not propagate into chunks', () => {
    const result = generateXContent(
      makeArticle('<p>Safe <script>bad()</script>text</p>'),
    )
    const allText = result.chunks.map((chunk) => chunk.text).join(' ')
    expect(allText).toContain('Safe text')
    expect(allText).not.toContain('<script')
    expect(allText).not.toContain('bad(')
  })
})
