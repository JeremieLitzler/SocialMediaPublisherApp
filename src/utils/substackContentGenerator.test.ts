import { describe, it, expect } from 'vitest'
import { generateSubstackContent } from './substackContentGenerator'
import type { Article } from '@/types/article'

function makeEnglishArticle(): Article {
  return {
    url: 'https://iamjeremie.me/post/test/',
    blog: 'english',
    title: 'Test Article',
    description: 'A test description',
    imageUrl: 'https://iamjeremie.me/img/hero.jpg',
    imageAlt: 'Hero image',
    imageCaption: null,
    introduction: '<p>Intro paragraph.</p>',
    category: 'Technology',
    tags: ['vue', 'typescript'],
    followMeSnippet: '<p>Follow me.</p>',
    imageCreditSnippet: null,
  }
}

function makeFrenchArticle(): Article {
  return {
    ...makeEnglishArticle(),
    url: 'https://jeremielitzler.fr/post/test/',
    blog: 'french',
  }
}

describe('generateSubstackContent', () => {
  it('maps title directly from article', () => {
    const result = generateSubstackContent(makeEnglishArticle())
    expect(result.title).toBe('Test Article')
  })

  it('maps description directly from article', () => {
    const result = generateSubstackContent(makeEnglishArticle())
    expect(result.description).toBe('A test description')
  })

  it('maps category directly from article', () => {
    const result = generateSubstackContent(makeEnglishArticle())
    expect(result.category).toBe('Technology')
  })

  it('passes tags array through unchanged', () => {
    const result = generateSubstackContent(makeEnglishArticle())
    expect(result.tags).toEqual(['vue', 'typescript'])
  })

  it('bodyHtml contains img tag with correct src', () => {
    const result = generateSubstackContent(makeEnglishArticle())
    expect(result.bodyHtml).toContain('<img src="https://iamjeremie.me/img/hero.jpg"')
  })

  it('bodyHtml contains img tag with correct alt', () => {
    const result = generateSubstackContent(makeEnglishArticle())
    expect(result.bodyHtml).toContain('alt="Hero image"')
  })

  it('bodyHtml omits figcaption when imageCreditSnippet is null', () => {
    const result = generateSubstackContent(makeEnglishArticle())
    expect(result.bodyHtml).not.toContain('<figcaption>')
  })

  it('bodyHtml contains figcaption when imageCreditSnippet is present', () => {
    const article = { ...makeEnglishArticle(), imageCreditSnippet: '<p>Photo by Jane</p>' }
    const result = generateSubstackContent(article)
    expect(result.bodyHtml).toContain('<figcaption>Photo by Jane</figcaption>')
  })

  it('bodyHtml contains introduction HTML verbatim', () => {
    const result = generateSubstackContent(makeEnglishArticle())
    expect(result.bodyHtml).toContain('<p>Intro paragraph.</p>')
  })

  it('bodyHtml UTM link has utm_source=Substack', () => {
    const result = generateSubstackContent(makeEnglishArticle())
    expect(result.bodyHtml).toContain('utm_source=Substack')
  })

  it('bodyHtml UTM link has utm_medium=social', () => {
    const result = generateSubstackContent(makeEnglishArticle())
    expect(result.bodyHtml).toContain('utm_medium=social')
  })

  it('bodyHtml UTM link anchor text is the English phrase for English article', () => {
    const result = generateSubstackContent(makeEnglishArticle())
    expect(result.bodyHtml).toContain("Let's review this in the full article")
  })

  it('bodyHtml UTM link anchor text is the French phrase for French article', () => {
    const result = generateSubstackContent(makeFrenchArticle())
    expect(result.bodyHtml).toContain("Allez lire l'article complet")
  })

  it('bodyHtml contains EN attribution for English article', () => {
    const result = generateSubstackContent(makeEnglishArticle())
    expect(result.bodyHtml).toContain('Originally published on')
    expect(result.bodyHtml).toContain('iamjeremie.me')
  })

  it('bodyHtml English attribution links to iamjeremie.me with UTM params', () => {
    const result = generateSubstackContent(makeEnglishArticle())
    expect(result.bodyHtml).toContain(
      'href="https://iamjeremie.me/?utm_medium=social&utm_source=Substack"',
    )
  })

  it('bodyHtml attribution line is wrapped in em tags', () => {
    const result = generateSubstackContent(makeEnglishArticle())
    expect(result.bodyHtml).toContain('<em>')
    expect(result.bodyHtml).toContain('</em>')
  })

  it('bodyHtml contains EN share text for English article', () => {
    const result = generateSubstackContent(makeEnglishArticle())
    expect(result.bodyHtml).toContain('Thanks for reading my publication!')
  })

  it('bodyHtml contains FR attribution for French article', () => {
    const result = generateSubstackContent(makeFrenchArticle())
    expect(result.bodyHtml).toContain('Originalement publiée sur')
    expect(result.bodyHtml).toContain('jeremielitzler.fr')
  })

  it('bodyHtml French attribution links to jeremielitzler.fr with UTM params', () => {
    const result = generateSubstackContent(makeFrenchArticle())
    expect(result.bodyHtml).toContain(
      'href="https://jeremielitzler.fr/?utm_medium=social&utm_source=Substack"',
    )
  })

  it('bodyHtml contains FR share text for French article', () => {
    const result = generateSubstackContent(makeFrenchArticle())
    expect(result.bodyHtml).toContain('Merci pour votre intérêt pour ma publication !')
  })
})
