import { describe, it, expect } from 'vitest'
import { generateLinkedInContent } from './linkedInContentGenerator'
import { generateUTMLink } from './utm'
import type { Article } from '@/types/article'

/**
 * Minimal Article fixture.
 * Only `url` and `introduction` matter for linkedInContentGenerator;
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

describe('generateLinkedInContent', () => {
  describe('required spec: output body contains plain text introduction', () => {
    it('body contains the plain text from a single-paragraph introduction', () => {
      const introText = 'This is the article introduction.'
      const article = makeArticle({ introduction: `<p>${introText}</p>` })
      const result = generateLinkedInContent(article)
      expect(result.body).toContain(introText)
    })

    it('body contains plain text from a multi-paragraph introduction', () => {
      const para1 = 'First paragraph of the introduction.'
      const para2 = 'Second paragraph of the introduction.'
      const article = makeArticle({ introduction: `<p>${para1}</p><p>${para2}</p>` })
      const result = generateLinkedInContent(article)
      expect(result.body).toContain(para1)
      expect(result.body).toContain(para2)
    })
  })

  describe('required spec: output body contains ⬇️⬇️⬇️', () => {
    it('body always contains the visual separator ⬇️⬇️⬇️', () => {
      const article = makeArticle({ introduction: '<p>Some intro text.</p>' })
      const result = generateLinkedInContent(article)
      expect(result.body).toContain('⬇️⬇️⬇️')
    })
  })

  describe('required spec: output body ends with UTM-tagged link (utm_source=LinkedIn)', () => {
    it('body ends with the UTM link', () => {
      const url = 'https://iamjeremie.me/article/hello'
      const article = makeArticle({ url, introduction: '<p>Some intro.</p>' })
      const utmLink = generateUTMLink(url, 'LinkedIn')
      const result = generateLinkedInContent(article)
      expect(result.body.endsWith(utmLink)).toBe(true)
    })

    it('UTM link contains utm_source=LinkedIn', () => {
      const url = 'https://iamjeremie.me/article/hello'
      const article = makeArticle({ url, introduction: '<p>Some intro.</p>' })
      const result = generateLinkedInContent(article)
      expect(result.body).toContain('utm_source=LinkedIn')
    })

    it('UTM link contains utm_medium=social', () => {
      const url = 'https://iamjeremie.me/article/hello'
      const article = makeArticle({ url, introduction: '<p>Some intro.</p>' })
      const result = generateLinkedInContent(article)
      expect(result.body).toContain('utm_medium=social')
    })
  })

  describe('required spec: HTML tags are stripped from the introduction', () => {
    it('no HTML angle-bracket characters appear in the body', () => {
      const article = makeArticle({
        introduction: '<p>Hello <strong>world</strong> and <em>everything</em> in it.</p>',
      })
      const result = generateLinkedInContent(article)
      expect(result.body).not.toContain('<')
      expect(result.body).not.toContain('>')
    })

    it('strips <p>, <strong>, and <em> tags but keeps inner text', () => {
      const article = makeArticle({
        introduction: '<p>Hello <strong>world</strong>!</p>',
      })
      const result = generateLinkedInContent(article)
      expect(result.body).toContain('Hello world!')
    })

    it('strips <a> tags and keeps link text', () => {
      const article = makeArticle({
        introduction: '<p>Visit <a href="https://example.com">this link</a> for more.</p>',
      })
      const result = generateLinkedInContent(article)
      expect(result.body).toContain('Visit this link for more.')
      expect(result.body).not.toContain('href')
    })
  })

  describe('required spec: UTM link appears on its own line after the separator', () => {
    it('separator and UTM link are on consecutive lines with no blank line between them', () => {
      const url = 'https://iamjeremie.me/article/hello'
      const article = makeArticle({ url, introduction: '<p>Intro text.</p>' })
      const utmLink = generateUTMLink(url, 'LinkedIn')
      const result = generateLinkedInContent(article)
      // The separator line followed immediately (no blank line) by the UTM link
      expect(result.body).toContain(`⬇️⬇️⬇️\n${utmLink}`)
    })

    it('separator is preceded by a blank line (\\n\\n before ⬇️⬇️⬇️)', () => {
      const article = makeArticle({ introduction: '<p>Intro text.</p>' })
      const result = generateLinkedInContent(article)
      expect(result.body).toContain(`\n\n⬇️⬇️⬇️`)
    })
  })

  describe('additional: paragraph breaks are preserved', () => {
    it('two paragraphs are separated by \\n\\n in the body', () => {
      const para1 = 'First paragraph.'
      const para2 = 'Second paragraph.'
      const article = makeArticle({ introduction: `<p>${para1}</p><p>${para2}</p>` })
      const result = generateLinkedInContent(article)
      expect(result.body).toContain(`${para1}\n\n${para2}`)
    })

    it('three paragraphs each separated by \\n\\n', () => {
      const para1 = 'Paragraph one.'
      const para2 = 'Paragraph two.'
      const para3 = 'Paragraph three.'
      const article = makeArticle({
        introduction: `<p>${para1}</p><p>${para2}</p><p>${para3}</p>`,
      })
      const result = generateLinkedInContent(article)
      expect(result.body).toContain(`${para1}\n\n${para2}\n\n${para3}`)
    })
  })

  describe('additional: empty introduction produces only separator and UTM link', () => {
    it('empty introduction string: body is separator + UTM link only', () => {
      const url = 'https://iamjeremie.me/article/empty'
      const article = makeArticle({ url, introduction: '' })
      const utmLink = generateUTMLink(url, 'LinkedIn')
      const result = generateLinkedInContent(article)
      // No introduction text before the separator; body = "\n\n⬇️⬇️⬇️\n{utmLink}"
      // (the paragraph join is empty string, then PARAGRAPH_SEPARATOR + VISUAL_SEPARATOR + '\n' + utmLink)
      expect(result.body).toContain('⬇️⬇️⬇️')
      expect(result.body.endsWith(utmLink)).toBe(true)
      // There should be no meaningful text before the separator
      const separatorIndex = result.body.indexOf('⬇️⬇️⬇️')
      const beforeSeparator = result.body.slice(0, separatorIndex).trim()
      expect(beforeSeparator).toBe('')
    })

    it('introduction with only empty <p> tags: body contains no paragraph text', () => {
      const url = 'https://iamjeremie.me/article/empty-p'
      const article = makeArticle({ url, introduction: '<p></p><p>  </p>' })
      const utmLink = generateUTMLink(url, 'LinkedIn')
      const result = generateLinkedInContent(article)
      expect(result.body).toContain('⬇️⬇️⬇️')
      expect(result.body.endsWith(utmLink)).toBe(true)
      const separatorIndex = result.body.indexOf('⬇️⬇️⬇️')
      const beforeSeparator = result.body.slice(0, separatorIndex).trim()
      expect(beforeSeparator).toBe('')
    })
  })

  describe('body format: exact structure verification', () => {
    it('single paragraph: body matches [intro]\\n\\n⬇️⬇️⬇️\\n[utmLink]', () => {
      const url = 'https://iamjeremie.me/article/format-check'
      const introText = 'Exact format check sentence.'
      const article = makeArticle({ url, introduction: `<p>${introText}</p>` })
      const utmLink = generateUTMLink(url, 'LinkedIn')
      const result = generateLinkedInContent(article)
      expect(result.body).toBe(`${introText}\n\n⬇️⬇️⬇️\n${utmLink}`)
    })

    it('two paragraphs: body matches [p1]\\n\\n[p2]\\n\\n⬇️⬇️⬇️\\n[utmLink]', () => {
      const url = 'https://iamjeremie.me/article/two-paras'
      const para1 = 'First paragraph content.'
      const para2 = 'Second paragraph content.'
      const article = makeArticle({ url, introduction: `<p>${para1}</p><p>${para2}</p>` })
      const utmLink = generateUTMLink(url, 'LinkedIn')
      const result = generateLinkedInContent(article)
      expect(result.body).toBe(`${para1}\n\n${para2}\n\n⬇️⬇️⬇️\n${utmLink}`)
    })
  })
})
