/**
 * X (Twitter) Content Generator
 *
 * Splits an article introduction into tweet-sized chunks (≤280 chars each),
 * with visual separators and a UTM-tagged link on the last chunk.
 *
 * Chunking is paragraph-first: each HTML <p> element is treated as an
 * independent unit. Content from different paragraphs is never merged.
 */

import type { Article, XChunk, XContent } from '@/types/article'
import { generateUTMLink } from './utm'

const MAX_CHUNK_LENGTH = 280

/**
 * Extract plain text from each <p> element in an HTML string.
 * Uses DOMParser and reads textContent (never innerHTML) to prevent
 * any HTML from reaching the chunk strings.
 *
 * @param html - Raw HTML string containing <p> elements
 * @returns Array of trimmed non-empty paragraph plain-text strings
 */
function extractParagraphTexts(html: string): string[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const paragraphNodes = doc.querySelectorAll('p')
  const texts: string[] = []

  for (const node of paragraphNodes) {
    const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim()
    if (text.length > 0) {
      texts.push(text)
    }
  }

  return texts
}

/**
 * Split plain text into sentences, keeping trailing punctuation attached.
 * Splits on `. `, `! `, `? ` boundaries.
 *
 * @param text - Plain text to split
 * @returns Array of sentence strings
 */
function splitIntoSentences(text: string): string[] {
  const sentences: string[] = []
  let remaining = text

  while (remaining.length > 0) {
    const dotIndex = remaining.indexOf('. ')
    const bangIndex = remaining.indexOf('! ')
    const questionIndex = remaining.indexOf('? ')

    const candidates = [dotIndex, bangIndex, questionIndex].filter((index) => index !== -1)

    if (candidates.length === 0) {
      sentences.push(remaining)
      break
    }

    const splitAt = Math.min(...candidates)
    sentences.push(remaining.slice(0, splitAt + 1))
    remaining = remaining.slice(splitAt + 2)
  }

  return sentences.filter((sentence) => sentence.length > 0)
}

/**
 * Accumulate sentences from one paragraph into raw chunks where each chunk
 * does not exceed MAX_CHUNK_LENGTH. A sentence longer than MAX_CHUNK_LENGTH
 * becomes its own chunk regardless.
 *
 * @param sentences - Array of sentence strings from a single paragraph
 * @returns Array of raw chunk strings (without formatting suffixes)
 */
function buildChunksFromSentences(sentences: string[]): string[] {
  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if (current === '') {
      current = sentence
      continue
    }

    const candidate = current + ' ' + sentence

    if (candidate.length <= MAX_CHUNK_LENGTH) {
      current = candidate
      continue
    }

    chunks.push(current)
    current = sentence
  }

  if (current.length > 0) {
    chunks.push(current)
  }

  return chunks
}

/**
 * Check whether a paragraph text has any sentence boundary (`. `, `! `, `? `).
 *
 * @param text - Plain-text paragraph
 * @returns True when at least one sentence boundary exists
 */
function hasSentenceBoundary(text: string): boolean {
  return text.includes('. ') || text.includes('! ') || text.includes('? ')
}

/**
 * Convert a single paragraph text into raw chunk objects.
 * Short paragraphs (≤280 chars) become one chunk.
 * Long paragraphs are split at sentence boundaries when possible;
 * if no boundary exists the whole paragraph becomes one oversized chunk.
 *
 * @param paragraphText - Trimmed plain-text content of one <p> element
 * @returns Array of raw chunk objects (text without formatting suffix, oversized flag)
 */
function buildRawChunksFromParagraph(paragraphText: string): Array<{ text: string; oversized?: boolean }> {
  if (paragraphText.length <= MAX_CHUNK_LENGTH) {
    return [{ text: paragraphText }]
  }

  if (!hasSentenceBoundary(paragraphText)) {
    return [{ text: paragraphText, oversized: true }]
  }

  const sentences = splitIntoSentences(paragraphText)
  const chunkTexts = buildChunksFromSentences(sentences)
  return chunkTexts.map((text) => ({ text }))
}

/**
 * Apply visual formatting to raw chunk objects:
 * - Every chunk except the last gets `\n\n⬇️` appended to its text.
 * - The last chunk gets `\n\n⬇️⬇️⬇️\n{utmLink}` appended to its text.
 * The `oversized` flag is preserved unchanged.
 *
 * @param rawChunks - Unformatted chunk objects
 * @param utmLink - UTM-tagged article URL
 * @returns Formatted XChunk objects ready for display/copy
 */
function formatChunks(rawChunks: Array<{ text: string; oversized?: boolean }>, utmLink: string): XChunk[] {
  return rawChunks.map((chunk, index) => {
    const isLast = index === rawChunks.length - 1
    const suffix = isLast ? '\n\n⬇️⬇️⬇️\n' + utmLink : '\n\n⬇️'
    const formattedText = chunk.text + suffix

    if (chunk.oversized) {
      return { text: formattedText, oversized: true }
    }

    return { text: formattedText }
  })
}

/**
 * Generate X (Twitter) content from an article.
 *
 * @param article - Extracted article data
 * @returns XContent with an array of formatted XChunk objects
 */
export function generateXContent(article: Article): XContent {
  const paragraphTexts = extractParagraphTexts(article.introduction)

  if (paragraphTexts.length === 0) {
    return { chunks: [] }
  }

  const rawChunks: Array<{ text: string; oversized?: boolean }> = []

  for (const paragraphText of paragraphTexts) {
    const paragraphChunks = buildRawChunksFromParagraph(paragraphText)
    rawChunks.push(...paragraphChunks)
  }

  const utmLink = generateUTMLink(article.url, 'X')
  const chunks = formatChunks(rawChunks, utmLink)

  return { chunks }
}
