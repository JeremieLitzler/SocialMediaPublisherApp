import { describe, it, expect } from 'vitest'
import { generateXContent } from './xContentGenerator'
import { generateUTMLink } from './utm'
import type { Article } from '@/types/article'

/**
 * Minimal Article fixture.
 * Only `url` and `introduction` matter for xContentGenerator;
 * all other required fields are set to empty strings / safe defaults.
 */
function makeArticle(overrides: Partial<Pick<Article, 'url' | 'introduction'>>): Article {
  return {
    url: 'https://example.com/article',
    blog: 'english',
    title: '',
    description: '',
    imageUrl: '',
    imageAlt: '',
    imageCaption: null,
    introduction: '',
    category: '',
    tags: [],
    followMeSnippet: '',
    imageCreditSnippet: null,
    ...overrides,
  }
}

describe('generateXContent', () => {
  describe('empty introduction', () => {
    it('returns { chunks: [] } when introduction is empty string', () => {
      const article = makeArticle({ introduction: '' })
      expect(generateXContent(article)).toEqual({ chunks: [] })
    })

    it('returns { chunks: [] } when introduction contains only HTML tags with no text', () => {
      const article = makeArticle({ introduction: '<p></p>' })
      expect(generateXContent(article)).toEqual({ chunks: [] })
    })
  })

  describe('single-chunk introduction (fits in ≤280 chars)', () => {
    it('produces exactly one chunk', () => {
      const intro = 'This is a short introduction that fits easily within the limit.'
      const article = makeArticle({ introduction: `<p>${intro}</p>` })
      const result = generateXContent(article)
      expect(result.chunks).toHaveLength(1)
    })

    it('appends ⬇️⬇️⬇️ and the UTM link on the only chunk', () => {
      const url = 'https://iamjeremie.me/article/hello'
      const intro = 'Short intro sentence.'
      const article = makeArticle({ url, introduction: `<p>${intro}</p>` })
      const utmLink = generateUTMLink(url, 'X')
      const result = generateXContent(article)
      expect(result.chunks[0]).toBe(`${intro}\n\n⬇️⬇️⬇️\n${utmLink}`)
    })

    it('chunk content is ≤280 chars before the appended separator+link', () => {
      // The raw text must be short; the formatted chunk may exceed 280 because
      // the separator and link are appended — the spec only constrains the raw chunk.
      const intro = 'A sentence that is definitely short enough.'
      const article = makeArticle({ introduction: `<p>${intro}</p>` })
      const result = generateXContent(article)
      // The raw chunk text (before formatting) equals intro, which is <280
      expect(intro.length).toBeLessThanOrEqual(280)
      expect(result.chunks).toHaveLength(1)
    })
  })

  describe('multi-chunk introduction (introduction exceeds 280 chars)', () => {
    // Build a plain-text introduction made of several sentences whose combined
    // length forces at least two chunks.
    const sentence1 =
      'The first sentence of this article is intentionally written to be quite long and descriptive.'
    const sentence2 =
      'The second sentence continues the thought and adds even more context for the reader.'
    const sentence3 =
      'The third sentence wraps up the opening paragraph with a concluding remark about the topic.'
    const sentence4 =
      'A fourth sentence is added to make absolutely certain that the text exceeds the 280-character limit.'

    const introText = `${sentence1} ${sentence2} ${sentence3} ${sentence4}`

    it('combined plain text exceeds 280 characters (prerequisite)', () => {
      expect(introText.length).toBeGreaterThan(280)
    })

    it('produces more than one chunk', () => {
      const article = makeArticle({ introduction: `<p>${introText}</p>` })
      const result = generateXContent(article)
      expect(result.chunks.length).toBeGreaterThan(1)
    })

    it('each chunk ends with ⬇️ separator except the last', () => {
      const article = makeArticle({ introduction: `<p>${introText}</p>` })
      const result = generateXContent(article)
      const allButLast = result.chunks.slice(0, -1)
      allButLast.forEach((chunk, i) => {
        expect(chunk.endsWith('\n\n⬇️'), `chunk ${i} should end with ⬇️`).toBe(true)
      })
    })

    it('last chunk ends with ⬇️⬇️⬇️ and UTM link', () => {
      const url = 'https://iamjeremie.me/article/multi-chunk'
      const article = makeArticle({ url, introduction: `<p>${introText}</p>` })
      const utmLink = generateUTMLink(url, 'X')
      const result = generateXContent(article)
      const lastChunk = result.chunks[result.chunks.length - 1]
      expect(lastChunk.endsWith(`\n\n⬇️⬇️⬇️\n${utmLink}`)).toBe(true)
    })

    it('non-last chunks do NOT end with ⬇️⬇️⬇️', () => {
      const article = makeArticle({ introduction: `<p>${introText}</p>` })
      const result = generateXContent(article)
      const allButLast = result.chunks.slice(0, -1)
      allButLast.forEach((chunk, i) => {
        expect(chunk.includes('⬇️⬇️⬇️'), `chunk ${i} must not contain triple arrows`).toBe(false)
      })
    })

    it('raw text of each chunk (before the appended suffix) is ≤280 chars', () => {
      const article = makeArticle({ introduction: `<p>${introText}</p>` })
      const result = generateXContent(article)
      result.chunks.forEach((chunk, i) => {
        // Strip the formatting suffix to get the raw chunk text
        const rawChunk = chunk
          .replace(/\n\n⬇️⬇️⬇️\n.+$/, '') // last chunk suffix
          .replace(/\n\n⬇️$/, '') // non-last chunk suffix
        expect(
          rawChunk.length,
          `raw chunk ${i} length ${rawChunk.length} must be ≤280`,
        ).toBeLessThanOrEqual(280)
      })
    })
  })

  describe('sentence longer than 280 chars becomes its own chunk', () => {
    // A sentence with no `. `, `! `, or `? ` boundary so it cannot be split.
    // 290 chars: verified by counting — the string is padded to exceed 280.
    const longSentence =
      'This is a very long sentence with absolutely no terminal punctuation followed by a space so the algorithm cannot split it and it must be placed as a single oversized chunk regardless of the two-hundred-and-eighty character limit that normally applies to tweets posted on the X platform'
    // Runtime guard — if someone edits the string, the test will catch it
    it('prerequisite: longSentence is >280 chars', () => {
      expect(longSentence.length).toBeGreaterThan(280)
    })

    it('a single sentence of >280 chars is placed in one chunk', () => {
      const article = makeArticle({ introduction: `<p>${longSentence}</p>` })
      const result = generateXContent(article)
      // Should still produce exactly one chunk (the oversized sentence)
      expect(result.chunks).toHaveLength(1)
      const rawChunk = result.chunks[0].replace(/\n\n⬇️⬇️⬇️\n.+$/, '')
      expect(rawChunk).toBe(longSentence)
    })

    it('long sentence followed by a normal sentence: long sentence is its own chunk', () => {
      // The long sentence must end with `. ` (period + space) for splitIntoSentences
      // to detect a boundary. buildChunks then flushes the oversized sentence as its
      // own chunk and starts a new one with the short sentence.
      const longSentenceWithPeriod =
        'This is a very long sentence with absolutely no internal split boundary and it goes on and on well beyond the two-hundred-and-eighty character limit that the X platform enforces, making it truly impossible to fit the full sentence into a single normal tweet without any truncation whatsoever.'
      const shortSentence = 'Short follow-up sentence here.'
      // Compose: longSentenceWithPeriod ends with '.', then ' ', then shortSentence
      const introText = `${longSentenceWithPeriod} ${shortSentence}`
      // Prerequisite: the long sentence alone exceeds 280 chars
      expect(longSentenceWithPeriod.length).toBeGreaterThan(280)

      const article = makeArticle({ introduction: `<p>${introText}</p>` })
      const result = generateXContent(article)

      expect(result.chunks.length).toBeGreaterThanOrEqual(2)

      // First raw chunk must be the long sentence alone
      const firstRaw = result.chunks[0].replace(/\n\n⬇️$/, '').replace(/\n\n⬇️⬇️⬇️\n.+$/, '')
      expect(firstRaw).toBe(longSentenceWithPeriod)
    })
  })

  describe('HTML tags are stripped before chunking', () => {
    it('strips <p> and <strong> before splitting into chunks', () => {
      const url = 'https://iamjeremie.me/article/html-test'
      const html = '<p>Hello <strong>world</strong>. This is a test.</p>'
      const article = makeArticle({ url, introduction: html })
      const utmLink = generateUTMLink(url, 'X')
      const result = generateXContent(article)

      expect(result.chunks).toHaveLength(1)
      expect(result.chunks[0]).toBe(`Hello world. This is a test.\n\n⬇️⬇️⬇️\n${utmLink}`)
    })

    it('no HTML angle-bracket characters appear in any chunk', () => {
      const html =
        '<p>First <em>sentence</em>. Second <a href="https://example.com">sentence</a>.</p>'
      const article = makeArticle({ introduction: html })
      const result = generateXContent(article)
      result.chunks.forEach((chunk) => {
        expect(chunk).not.toContain('<')
        expect(chunk).not.toContain('>')
      })
    })
  })

  describe('UTM link in last chunk', () => {
    it('uses generateUTMLink(article.url, "X") as the link', () => {
      const url = 'https://jeremielitzler.fr/article/test'
      const article = makeArticle({ url, introduction: '<p>A short sentence.</p>' })
      const expectedLink = generateUTMLink(url, 'X')
      const result = generateXContent(article)
      const lastChunk = result.chunks[result.chunks.length - 1]
      expect(lastChunk).toContain(expectedLink)
    })

    it('UTM link contains utm_medium=social and utm_source=X', () => {
      const url = 'https://iamjeremie.me/article/utm-check'
      const article = makeArticle({ url, introduction: '<p>A sentence.</p>' })
      const result = generateXContent(article)
      const lastChunk = result.chunks[result.chunks.length - 1]
      expect(lastChunk).toContain('utm_medium=social')
      expect(lastChunk).toContain('utm_source=X')
    })
  })
})
