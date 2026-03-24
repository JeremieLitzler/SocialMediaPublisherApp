/**
 * Shared HTML-building utilities for platform content generators.
 *
 * Centralises the figure HTML builder, the visual separator constant,
 * and the paragraph-extraction helper that were previously duplicated
 * across mediumContentGenerator.ts, substackContentGenerator.ts,
 * linkedInContentGenerator.ts, and xContentGenerator.ts.
 */

import type { Article } from '@/types/article'
import { htmlToText } from './htmlToText'

/**
 * Visual separator used at the end of content blocks to indicate
 * that the full article is available at the linked URL.
 */
export const VISUAL_SEPARATOR = '⬇️⬇️⬇️'

/**
 * Build a `<figcaption>` element from an image credit HTML snippet.
 * Returns an empty string when no credit is present.
 *
 * @param imageCreditSnippet - Raw HTML string starting with "Photo by"/"Photo de", or null
 * @returns Figcaption HTML string or empty string
 */
export function buildFigcaption(imageCreditSnippet: string | null): string {
  if (imageCreditSnippet === null) return ''
  return `<figcaption>${htmlToText(imageCreditSnippet)}</figcaption>`
}

/**
 * Build a `<figure>` element containing the article's featured image
 * and an optional figcaption derived from the image credit snippet.
 *
 * @param article - Extracted article data
 * @returns Figure HTML string
 */
export function buildFigureHtml(article: Article): string {
  const imgTag = `<img src="${article.imageUrl}" alt="${article.imageAlt}" />`
  const figcaption = buildFigcaption(article.imageCreditSnippet)
  return `<figure>${imgTag}${figcaption}</figure>`
}

/**
 * Extract plain-text paragraphs from an HTML string.
 *
 * Uses DOMParser to safely parse the HTML. Each `<p>` element
 * becomes one entry in the returned array. Internal whitespace
 * within each paragraph is collapsed to a single space.
 * Empty paragraphs are excluded.
 *
 * @param html - Raw HTML string containing `<p>` elements
 * @returns Array of trimmed, whitespace-collapsed, non-empty paragraph strings
 */
export function extractParagraphTexts(html: string): string[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const paragraphNodes = doc.querySelectorAll('p')
  const texts: string[] = []

  for (const node of paragraphNodes) {
    const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim()
    if (text.length > 0) texts.push(text)
  }

  return texts
}
