/**
 * Issue #132 — localized Medium read-article anchor.
 *
 * Covers the Medium anchor scenarios from test-cases.md that are observable at
 * the generator level: default language selection (TC-1..TC-4), custom saved
 * override / reset (TC-5..TC-7), and the security render path (TC-14).
 *
 * The "live saved snippet values" are modelled by passing an explicit SnippetMap
 * to generateMediumContent — the exact map useSnippets hands the generator.
 */
import { describe, it, expect } from 'vitest'
import { generateMediumContent } from './mediumContentGenerator'
import { generateSubstackContent } from './substackContentGenerator'
import { generateUTMLink } from './utm'
import { sanitizeBodyHtml } from './sanitize'
import { SNIPPET_DEFAULTS } from '@/config/snippets'
import type { Article, SnippetMap } from '@/types/article'

const FR_DEFAULT_ANCHOR = "Venez lire l'article complet"
const EN_DEFAULT_ANCHOR = "Let's review this in the full article"
const OLD_EN_ANCHOR = 'Read the full article'

function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    url: 'https://iamjeremie.me/post/test/',
    blog: 'english',
    title: 'Test Title',
    description: 'Test description',
    imageUrl: 'https://iamjeremie.me/img/hero.jpg',
    imageAlt: 'A hero image',
    imageCaption: null,
    introduction: '<p>Intro paragraph.</p>',
    category: 'Technology',
    tags: ['vue', 'typescript'],
    followMeSnippet: '<p>Follow me on socials.</p>',
    imageCreditSnippet: null,
    ...overrides,
  }
}

function makeFrenchArticle(overrides: Partial<Article> = {}): Article {
  return makeArticle({
    url: 'https://jeremielitzler.fr/post/2026-07/prothese-dentaire-en-acetal/',
    blog: 'french',
    ...overrides,
  })
}

function withSnippets(overrides: Partial<SnippetMap>): SnippetMap {
  return { ...SNIPPET_DEFAULTS, ...overrides }
}

describe('Medium localized anchor — default snippets', () => {
  it('TC-1: French article uses the French anchor by default', () => {
    const result = generateMediumContent(makeFrenchArticle())
    expect(result.bodyHtml).toContain(`>${FR_DEFAULT_ANCHOR}</a>`)
    expect(result.bodyHtml).not.toContain(OLD_EN_ANCHOR)
    expect(result.bodyHtml).not.toContain(EN_DEFAULT_ANCHOR)
  })

  it('TC-2: English article uses the English anchor by default', () => {
    const result = generateMediumContent(makeArticle({ blog: 'english' }))
    expect(result.bodyHtml).toContain(`>${EN_DEFAULT_ANCHOR}</a>`)
    expect(result.bodyHtml).not.toContain(OLD_EN_ANCHOR)
    expect(result.bodyHtml).not.toContain(FR_DEFAULT_ANCHOR)
  })

  it('TC-1: French anchor appears exactly once', () => {
    const result = generateMediumContent(makeFrenchArticle())
    const occurrences = result.bodyHtml.split(FR_DEFAULT_ANCHOR).length - 1
    expect(occurrences).toBe(1)
  })

  it('TC-3: only the anchor text changes — separator, link, URL, and UTM are unchanged', () => {
    const article = makeFrenchArticle()
    const utmLink = generateUTMLink(article.url, 'Medium')
    const result = generateMediumContent(article)
    // Same visual-separator paragraph and anchor element, only the text differs.
    expect(result.bodyHtml).toContain(
      `<p>⬇️⬇️⬇️<br /><a href="${utmLink}">${FR_DEFAULT_ANCHOR}</a></p>`,
    )
    // href carries the same UTM-tagged article URL as before this change.
    expect(utmLink.endsWith('?utm_medium=social&utm_source=Medium')).toBe(true)
  })

  it('TC-4: surrounding Medium blocks are unaffected by the anchor change', () => {
    const article = makeFrenchArticle({
      introduction: '<p>Une introduction.</p>',
      followMeSnippet: '<p>Suivez-moi.</p>',
    })
    const result = generateMediumContent(article)
    expect(result.bodyHtml).toContain(
      `<figure><img src="${article.imageUrl}" alt="${article.imageAlt}" /></figure>`,
    )
    expect(result.bodyHtml).toContain('<p>Une introduction.</p>')
    expect(result.bodyHtml).toContain('<p>Suivez-moi.</p>')
    expect(result.bodyHtml).toContain(SNIPPET_DEFAULTS.FR_WHY_HEADING)
    expect(result.bodyHtml).toContain('<hr />')
  })

  it('TC-4: Substack output for the same article is independent of the Medium anchor', () => {
    const article = makeFrenchArticle()
    const substack = generateSubstackContent(article)
    // Substack keeps its own UTM source and attribution regardless of Medium.
    expect(substack.bodyHtml).toContain('utm_source=Substack')
    expect(substack.bodyHtml).not.toContain('utm_source=Medium')
  })
})

describe('Medium localized anchor — custom saved override and reset', () => {
  it('TC-5: a saved custom French anchor overrides the default', () => {
    const snippets = withSnippets({ FR_MEDIUM_UTM_ANCHOR: 'Lire la suite ici' })
    const result = generateMediumContent(makeFrenchArticle(), snippets)
    expect(result.bodyHtml).toContain('>Lire la suite ici</a>')
    expect(result.bodyHtml).not.toContain(FR_DEFAULT_ANCHOR)
  })

  it('TC-6: a saved custom English anchor overrides the default', () => {
    const snippets = withSnippets({ EN_MEDIUM_UTM_ANCHOR: 'Read more on my blog' })
    const result = generateMediumContent(makeArticle({ blog: 'english' }), snippets)
    expect(result.bodyHtml).toContain('>Read more on my blog</a>')
    expect(result.bodyHtml).not.toContain(EN_DEFAULT_ANCHOR)
  })

  it('TC-7: reset (defaults map) restores the anchor defaults for both languages', () => {
    const fr = generateMediumContent(makeFrenchArticle(), SNIPPET_DEFAULTS)
    const en = generateMediumContent(makeArticle({ blog: 'english' }), SNIPPET_DEFAULTS)
    expect(fr.bodyHtml).toContain(`>${FR_DEFAULT_ANCHOR}</a>`)
    expect(en.bodyHtml).toContain(`>${EN_DEFAULT_ANCHOR}</a>`)
  })
})

describe('Medium localized anchor — security (TC-14)', () => {
  it('renders a stored HTML-bearing anchor value through the existing sanitisation', () => {
    const snippets = withSnippets({
      FR_MEDIUM_UTM_ANCHOR: '<img src=x onerror=alert(1)>',
    })
    const result = generateMediumContent(makeFrenchArticle(), snippets)
    // Same render path PlatformMedium uses for the Medium body.
    const rendered = sanitizeBodyHtml(result.bodyHtml)
    expect(rendered).not.toContain('onerror')
    expect(rendered).not.toContain('alert(1)')
  })

  it('does not introduce a raw/unsanitised path — script markup in the anchor is stripped', () => {
    const snippets = withSnippets({
      EN_MEDIUM_UTM_ANCHOR: '"><script>alert(1)</script>',
    })
    const result = generateMediumContent(makeArticle({ blog: 'english' }), snippets)
    const rendered = sanitizeBodyHtml(result.bodyHtml)
    expect(rendered).not.toContain('<script>')
  })
})
