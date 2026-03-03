/**
 * LinkedIn Content Generator
 *
 * Composes an article introduction as plain text with paragraph breaks preserved,
 * followed by a visual separator and a UTM-tagged link.
 *
 * LinkedIn renders line breaks, so paragraph breaks must be preserved as \n\n.
 * htmlToText() collapses all whitespace, making it unsuitable here.
 * Instead, each <p> element's textContent is extracted individually.
 */

import type { Article, LinkedInContent } from '@/types/article'
import { generateUTMLink } from './utm'

const PARAGRAPH_SEPARATOR = '\n\n'
const VISUAL_SEPARATOR = '⬇️⬇️⬇️'

/**
 * Extract plain-text paragraphs from an HTML string, preserving paragraph breaks.
 *
 * Each <p> element becomes one entry in the returned array.
 * Whitespace within each paragraph is collapsed to a single space.
 *
 * @param html - Raw HTML string containing <p> elements
 * @returns Array of plain-text paragraph strings (empty paragraphs excluded)
 */
function extractParagraphs(html: string): string[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const paragraphs = Array.from(doc.querySelectorAll('p'))

  return paragraphs
    .map((paragraph) => (paragraph.textContent ?? '').replace(/\s+/g, ' ').trim())
    .filter((text) => text.length > 0)
}

/**
 * Generate LinkedIn content from an article.
 *
 * Body format:
 * ```
 * [paragraph 1]
 *
 * [paragraph 2]
 *
 * ⬇️⬇️⬇️
 * [UTM link]
 * ```
 *
 * @param article - Extracted article data
 * @returns LinkedInContent with a single formatted body string
 */
export function generateLinkedInContent(article: Article): LinkedInContent {
  const paragraphs = extractParagraphs(article.introduction)
  const introductionText = paragraphs.join(PARAGRAPH_SEPARATOR)
  const utmLink = generateUTMLink(article.url, 'LinkedIn')
  const body = introductionText + PARAGRAPH_SEPARATOR + VISUAL_SEPARATOR + '\n' + utmLink

  return { body }
}
