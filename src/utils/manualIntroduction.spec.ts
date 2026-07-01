import { describe, it, expect } from 'vitest'
import {
  MAX_MANUAL_INTRODUCTION_LENGTH,
  hasVisibleCharacter,
  boundManualIntroduction,
  toIntroductionHtml,
} from './manualIntroduction'
import { generateLinkedInContent } from './linkedInContentGenerator'
import { generateXContent } from './xContentGenerator'
import { generateMediumContent } from './mediumContentGenerator'
import { sanitizeBodyHtml } from './sanitize'
import type { Article } from '@/types/article'

function articleWithIntroduction(introduction: string): Article {
  return {
    url: 'https://iamjeremie.me/post/test/',
    blog: 'english',
    title: 'Title',
    description: 'Description',
    imageUrl: 'https://iamjeremie.me/image.png',
    imageAlt: 'Alt',
    imageCaption: null,
    introduction,
    category: 'tech',
    tags: ['vue'],
    followMeSnippet: '',
    imageCreditSnippet: null,
  }
}

describe('manualIntroduction utility — issue #125', () => {
  // TC-6 support — visibility check drives the disabled/enabled continue button
  it('treats empty and whitespace-only input as having no visible character', () => {
    expect(hasVisibleCharacter('')).toBe(false)
    expect(hasVisibleCharacter('   ')).toBe(false)
    expect(hasVisibleCharacter(' a ')).toBe(true)
  })

  // TC-12 — an over-long paste is clamped to the maximum length
  it('TC-12: bounds an over-long introduction to the maximum length', () => {
    const longText = 'a'.repeat(MAX_MANUAL_INTRODUCTION_LENGTH + 500)
    expect(boundManualIntroduction(longText).length).toBe(MAX_MANUAL_INTRODUCTION_LENGTH)
  })

  // TC-12 — the introduction reaching content generation is capped
  it('TC-12: the introduction reaching content is capped at the maximum length', () => {
    const longText = 'a'.repeat(MAX_MANUAL_INTRODUCTION_LENGTH + 500)
    const inner = toIntroductionHtml(longText)
      .replace(/^<p>/, '')
      .replace(/<\/p>$/, '')
    expect(inner.length).toBe(MAX_MANUAL_INTRODUCTION_LENGTH)
  })

  // TC-11 — typed angle-bracket markup appears as literal text on the text platforms
  it('TC-11: typed markup appears literally in LinkedIn and X bodies', () => {
    const article = articleWithIntroduction(toIntroductionHtml('<b>bold</b> and <i>italic</i>'))

    const linkedInBody = generateLinkedInContent(article).body
    expect(linkedInBody).toContain('<b>bold</b>')
    expect(linkedInBody).toContain('<i>italic</i>')

    const xBody = generateXContent(article)
      .chunks.map((chunk) => chunk.text)
      .join('\n')
    expect(xBody).toContain('<b>bold</b>')
  })

  // TC-10 — active markup is neutralised in the sanitised Medium preview
  it('TC-10: active markup in the manual intro is neutralised on the Medium preview', () => {
    const article = articleWithIntroduction(
      toIntroductionHtml('<script>alert(1)</script><img src=x onerror=alert(2)>'),
    )

    const sanitized = sanitizeBodyHtml(generateMediumContent(article).bodyHtml)
    const preview = new DOMParser().parseFromString(sanitized, 'text/html')

    expect(preview.querySelector('script')).toBeNull()
    const hasEventHandler = Array.from(preview.querySelectorAll('*')).some((element) =>
      element.hasAttribute('onerror'),
    )
    expect(hasEventHandler).toBe(false)
  })
})
