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
import { VISUAL_SEPARATOR, extractParagraphTexts } from './articleHtmlBuilder'

const PARAGRAPH_SEPARATOR = '\n\n'

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
  const paragraphs = extractParagraphTexts(article.introduction)
  const introductionText = paragraphs.join(PARAGRAPH_SEPARATOR)
  const utmLink = generateUTMLink(article.url, 'LinkedIn')
  const body = introductionText + PARAGRAPH_SEPARATOR + VISUAL_SEPARATOR + '\n' + utmLink

  return { body }
}
