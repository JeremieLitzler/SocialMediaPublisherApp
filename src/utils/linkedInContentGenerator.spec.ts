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

/** Build an article with the given introduction HTML, other fields fixed. */
function makeArticle(introduction: string): Article {
  return { ...baseArticle, introduction }
}

/** Return the introduction portion of the body (everything before the separator). */
function introText(body: string): string {
  const separatorIndex = body.indexOf('⬇️⬇️⬇️')
  return body.slice(0, separatorIndex)
}

describe('generateLinkedInContent — introduction block rendering', () => {
  // TC-01 Paragraphs render as plain text, source order, whitespace collapsed
  it('renders paragraphs as plain text in order with whitespace collapsed', () => {
    const result = generateLinkedInContent(
      makeArticle('<p>First   paragraph.</p><p>Second\n\nparagraph.</p>'),
    )
    expect(result.body).toContain('First paragraph.\n\nSecond paragraph.')
  })

  // TC-02 Unordered list items are bulleted, in order
  it('renders unordered list items as "- " bullets in list order', () => {
    const result = generateLinkedInContent(
      makeArticle('<ul><li>Alpha</li><li>Beta</li><li>Gamma</li></ul>'),
    )
    expect(result.body).toContain('- Alpha\n- Beta\n- Gamma')
  })

  // TC-03 Ordered list items are numbered sequentially
  it('renders ordered list items numbered "1. ", "2. ", "3. " in order', () => {
    const result = generateLinkedInContent(
      makeArticle('<ol><li>First</li><li>Second</li><li>Third</li></ol>'),
    )
    expect(result.body).toContain('1. First\n2. Second\n3. Third')
  })

  // TC-04 Blockquote lines are quote-prefixed
  it('prefixes each blockquote line with "> "', () => {
    const result = generateLinkedInContent(
      makeArticle('<blockquote><p>Line one</p><p>Line two</p></blockquote>'),
    )
    expect(result.body).toContain('> Line one\n> Line two')
  })

  // TC-05 Code block is fenced with whitespace preserved
  it('fences code blocks and preserves internal line breaks and indentation', () => {
    const result = generateLinkedInContent(
      makeArticle('<pre>const x = 1\n  const y = 2</pre>'),
    )
    expect(result.body).toContain('```\nconst x = 1\n  const y = 2\n```')
  })
})

describe('generateLinkedInContent — source order across mixed block types', () => {
  // TC-06 List stays between its surrounding paragraphs
  it('keeps a list between its surrounding paragraphs', () => {
    const body = generateLinkedInContent(
      makeArticle('<p>Intro para.</p><ul><li>Item A</li></ul><p>After para.</p>'),
    ).body
    expect(body.indexOf('Intro para.')).toBeLessThan(body.indexOf('- Item A'))
    expect(body.indexOf('- Item A')).toBeLessThan(body.indexOf('After para.'))
  })

  // TC-07 All four non-paragraph types preserve interleaved order
  it('renders every block once in source order when all types are interleaved', () => {
    const body = generateLinkedInContent(
      makeArticle(
        '<p>P1.</p><ol><li>One</li></ol><blockquote><p>Quote.</p></blockquote>' +
          '<pre>code()</pre><p>P2.</p>',
      ),
    ).body

    const positions = [
      body.indexOf('P1.'),
      body.indexOf('1. One'),
      body.indexOf('> Quote.'),
      body.indexOf('```\ncode()\n```'),
      body.indexOf('P2.'),
    ]
    // Every block present exactly once...
    for (const position of positions) expect(position).toBeGreaterThanOrEqual(0)
    // ...and in ascending source order.
    const sorted = [...positions].sort((a, b) => a - b)
    expect(positions).toEqual(sorted)
  })
})

describe('generateLinkedInContent — empty / omitted blocks', () => {
  // TC-08 Empty paragraph produces no output
  it('omits a whitespace-only paragraph between two real paragraphs', () => {
    const result = generateLinkedInContent(
      makeArticle('<p>Real one.</p><p>   </p><p>Real two.</p>'),
    )
    expect(introText(result.body)).toBe('Real one.\n\nReal two.\n\n')
  })

  // TC-09 List with no non-empty items is omitted
  it('omits a list whose items are all empty, leaving surrounding blocks intact', () => {
    const result = generateLinkedInContent(
      makeArticle('<p>Before.</p><ul><li></li><li>   </li></ul><p>After.</p>'),
    )
    expect(introText(result.body)).toBe('Before.\n\nAfter.\n\n')
    expect(result.body).not.toContain('- ')
  })
})

describe('generateLinkedInContent — assembly', () => {
  // TC-10 Blocks separated by a blank line
  it('separates consecutive blocks with a blank line', () => {
    const result = generateLinkedInContent(
      makeArticle('<p>Para.</p><ul><li>Item</li></ul>'),
    )
    expect(result.body).toContain('Para.\n\n- Item')
  })

  // TC-11 Visual separator and UTM link tail unchanged
  it('still appends the visual separator and trailing UTM link', () => {
    const result = generateLinkedInContent(makeArticle('<ul><li>Only a list</li></ul>'))
    expect(result.body).toContain('⬇️⬇️⬇️')
    const lastLine = result.body.split('\n').at(-1)
    expect(lastLine).toContain('utm_medium=social&utm_source=LinkedIn')
  })

  // TC-12 No introduction yields only separator and link
  it('emits only the separator and link when the introduction is empty', () => {
    const result = generateLinkedInContent(makeArticle(''))
    expect(introText(result.body)).toBe('\n\n')
    expect(result.body).toContain('⬇️⬇️⬇️')
    expect(result.body).toContain('utm_source=LinkedIn')
  })
})

describe('generateLinkedInContent — security-relevant behaviour', () => {
  // TC-16 Block text comes from DOM text, not raw markup
  it('emits readable text only; script content and inline markup do not propagate', () => {
    const result = generateLinkedInContent(
      makeArticle(
        '<p>Safe text <script>alert("xss")</script>here</p>' +
          '<ul><li>Item <strong>bold</strong></li></ul>',
      ),
    )
    expect(result.body).toContain('Safe text here')
    expect(result.body).toContain('- Item bold')
    expect(result.body).not.toContain('<script')
    expect(result.body).not.toContain('alert(')
    expect(result.body).not.toContain('<strong>')
  })

  // TC-17 Long/pathological code-block content completes promptly
  it('produces a fence for a code block of repeated whitespace without hanging', () => {
    const result = generateLinkedInContent(
      makeArticle(`<pre>${'  \n'.repeat(5000)}visible</pre>`),
    )
    expect(result.body).toContain('```')
    expect(result.body).toContain('visible')
  })
})
