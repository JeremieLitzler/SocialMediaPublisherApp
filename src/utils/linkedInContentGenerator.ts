/**
 * LinkedIn Content Generator
 *
 * Composes an article introduction as plain text with block breaks preserved,
 * followed by a visual separator and a UTM-tagged link.
 *
 * LinkedIn renders line breaks, so block breaks must be preserved as \n\n.
 * Every introduction block — paragraphs, lists, blockquotes, and code blocks —
 * is rendered in source order via extractIntroductionBlocks().
 */

import type { Article, LinkedInContent } from '@/types/article'
import { generateUTMLink } from './utm'
import { VISUAL_SEPARATOR, extractIntroductionBlocks } from './articleHtmlBuilder'

const PARAGRAPH_SEPARATOR = '\n\n'

/**
 * Generate LinkedIn content from an article.
 *
 * Body format:
 * ```
 * [block 1]
 *
 * [block 2]
 *
 * ⬇️⬇️⬇️
 * [UTM link]
 * ```
 *
 * @param article - Extracted article data
 * @returns LinkedInContent with a single formatted body string
 */
export function generateLinkedInContent(article: Article): LinkedInContent {
  const blocks = extractIntroductionBlocks(article.introduction)
  const introductionText = blocks.map((block) => block.text).join(PARAGRAPH_SEPARATOR)
  const utmLink = generateUTMLink(article.url, 'LinkedIn')
  const body = introductionText + PARAGRAPH_SEPARATOR + VISUAL_SEPARATOR + '\n' + utmLink

  return { body }
}
