/**
 * Substack Content Generator
 *
 * Produces all fields required to manually create a Substack cross-post:
 * title, description, a ready-to-paste HTML body, category, and tags.
 *
 * The HTML body includes: featured image with optional caption, introduction,
 * UTM link, bilingual attribution line, and bilingual share block.
 */

import type { Article, SubstackContent } from '@/types/article'
import { generateUTMLink } from './utm'
import { htmlToText } from './htmlToText'
import { getSubstackShareBlockText } from '@/config/snippets'

const VISUAL_SEPARATOR = '⬇️⬇️⬇️'
const ENGLISH_BLOG_URL = 'https://iamjeremie.me'
const FRENCH_BLOG_URL = 'https://jeremielitzler.fr'

function buildFigcaption(imageCreditSnippet: string | null): string {
  if (imageCreditSnippet === null) return ''
  return `<figcaption>${htmlToText(imageCreditSnippet)}</figcaption>`
}

function buildFigureHtml(article: Article): string {
  const imgTag = `<img src="${article.imageUrl}" alt="${article.imageAlt}" />`
  const figcaption = buildFigcaption(article.imageCreditSnippet)
  return `<figure>${imgTag}${figcaption}</figure>`
}

function buildUtmBlock(url: string): string {
  const utmLink = generateUTMLink(url, 'Substack')
  return `<p>${VISUAL_SEPARATOR}<br /><a href="${utmLink}">I'd like to read the full article</a></p>`
}

function buildFrenchAttributionLine(): string {
  const utmLink = generateUTMLink(FRENCH_BLOG_URL, 'Substack')
  return `Originalement publiée sur <a href="${utmLink}">jeremielitzler.fr</a>.`
}

function buildEnglishAttributionLine(): string {
  const utmLink = generateUTMLink(ENGLISH_BLOG_URL, 'Substack')
  return `Originally published on <a href="${utmLink}">iamjeremie.me</a>`
}

function buildAttributionLine(blog: Article['blog']): string {
  if (blog === 'french') return buildFrenchAttributionLine()
  return buildEnglishAttributionLine()
}

function buildAttributionBlock(article: Article): string {
  return `<p><em>${buildAttributionLine(article.blog)}</em></p>`
}

function buildShareBlock(article: Article): string {
  const shareText = getSubstackShareBlockText(article.blog)
  return `<p>${shareText}</p>`
}

function buildBodyHtml(article: Article): string {
  return [
    buildFigureHtml(article),
    article.introduction,
    buildUtmBlock(article.url),
    buildAttributionBlock(article),
    buildShareBlock(article),
  ].join('')
}

/**
 * Generate Substack content from an extracted article.
 *
 * @param article - Extracted article data
 * @returns SubstackContent with all fields required for a Substack cross-post
 */
export function generateSubstackContent(article: Article): SubstackContent {
  return {
    title: article.title,
    description: article.description,
    bodyHtml: buildBodyHtml(article),
    category: article.category,
    tags: article.tags,
  }
}
