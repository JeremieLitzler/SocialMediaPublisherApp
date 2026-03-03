/**
 * Medium Content Generator
 *
 * Produces all fields required to manually create a Medium cross-post:
 * title, description, image metadata, a ready-to-paste HTML body,
 * canonical URL, category, and tags.
 *
 * The HTML body includes: featured image, introduction, UTM link,
 * follow-me snippet, and a bilingual "Why" explanation block.
 */

import type { Article, MediumContent } from '@/types/article'
import { generateUTMLink } from './utm'
import { htmlToText } from './htmlToText'
import { getWhySnippet } from '@/config/snippets'

const VISUAL_SEPARATOR = '⬇️⬇️⬇️'

function buildImageCaption(imageCreditSnippet: string | null): string {
  if (imageCreditSnippet === null) return ''
  return htmlToText(imageCreditSnippet)
}

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
  const utmLink = generateUTMLink(url, 'Medium')
  return `<p>${VISUAL_SEPARATOR}<br /><a href="${utmLink}">${utmLink}</a></p>`
}

function buildWhyBlock(article: Article): string {
  const snippet = getWhySnippet(article.blog)
  return `<h2>${snippet.heading}</h2>${snippet.bodyHtml}`
}

function buildBodyHtml(article: Article): string {
  return [
    buildFigureHtml(article),
    '<hr />',
    article.introduction,
    buildUtmBlock(article.url),
    '<hr />',
    article.followMeSnippet,
    '<hr />',
    buildWhyBlock(article),
  ].join('')
}

/**
 * Generate Medium content from an extracted article.
 *
 * @param article - Extracted article data
 * @returns MediumContent with all fields required for a Medium cross-post
 */
export function generateMediumContent(article: Article): MediumContent {
  return {
    title: article.title,
    description: article.description,
    imageAlt: article.imageAlt,
    imageCaption: buildImageCaption(article.imageCreditSnippet),
    bodyHtml: buildBodyHtml(article),
    canonicalUrl: article.url,
    category: article.category,
    tags: article.tags,
  }
}
