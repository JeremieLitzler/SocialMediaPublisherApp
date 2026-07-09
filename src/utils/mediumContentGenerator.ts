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

import type { Article, MediumContent, SnippetMap } from '@/types/article'
import { generateUTMLink } from './utm'
import { htmlToText } from './htmlToText'
import { getMediumUtmAnchorText, getWhySnippet, SNIPPET_DEFAULTS } from '@/config/snippets'
import { VISUAL_SEPARATOR, buildFigureHtml } from './articleHtmlBuilder'

function buildImageCaption(imageCreditSnippet: string | null): string {
  if (imageCreditSnippet === null) return ''
  return htmlToText(imageCreditSnippet)
}

function buildUtmBlock(
  url: string,
  blog: Article['blog'],
  snippets: Readonly<SnippetMap>,
): string {
  const utmLink = generateUTMLink(url, 'Medium')
  const anchorText = getMediumUtmAnchorText(blog, snippets)
  return `<p>${VISUAL_SEPARATOR}<br /><a href="${utmLink}">${anchorText}</a></p>`
}

function buildWhyBlock(article: Article, snippets: Readonly<SnippetMap>): string {
  const snippet = getWhySnippet(article.blog, snippets)
  return `<h2>${snippet.heading}</h2>${snippet.bodyHtml}`
}

function buildBodyHtml(article: Article, snippets: Readonly<SnippetMap>): string {
  return [
    buildFigureHtml(article),
    '<hr />',
    article.introduction,
    buildUtmBlock(article.url, article.blog, snippets),
    '<hr />',
    article.followMeSnippet,
    '<hr />',
    buildWhyBlock(article, snippets),
  ].join('')
}

/**
 * Generate Medium content from an extracted article.
 *
 * @param article - Extracted article data
 * @param snippets - Optional live snippet map from useSnippets (defaults to SNIPPET_DEFAULTS)
 * @returns MediumContent with all fields required for a Medium cross-post
 */
export function generateMediumContent(
  article: Article,
  snippets: Readonly<SnippetMap> = SNIPPET_DEFAULTS,
): MediumContent {
  return {
    title: article.title,
    description: article.description,
    imageAlt: article.imageAlt,
    imageCaption: buildImageCaption(article.imageCreditSnippet),
    bodyHtml: buildBodyHtml(article, snippets),
    canonicalUrl: article.url,
    category: article.category,
    tags: article.tags,
  }
}
