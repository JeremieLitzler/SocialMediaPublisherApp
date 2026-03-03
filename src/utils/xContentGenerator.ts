/**
 * X (Twitter) Content Generator
 *
 * Splits an article introduction into tweet-sized chunks (≤280 chars each),
 * with visual separators and a UTM-tagged link on the last chunk.
 */

import type { Article, XContent } from '@/types/article'
import { htmlToText } from './htmlToText'
import { generateUTMLink } from './utm'

const MAX_CHUNK_LENGTH = 280

/**
 * Split plain text into sentences, keeping trailing punctuation attached.
 *
 * Splits on `. `, `! `, `? ` boundaries so the punctuation stays with
 * the sentence that produced it.
 *
 * @param text - Collapsed plain text
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
 * Accumulate sentences into chunks where each chunk does not exceed MAX_CHUNK_LENGTH.
 * A sentence longer than MAX_CHUNK_LENGTH becomes its own chunk regardless.
 *
 * @param sentences - Array of sentence strings
 * @returns Array of chunk strings (without formatting)
 */
function buildChunks(sentences: string[]): string[] {
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
 * Apply visual formatting to chunks:
 * - Every chunk except the last gets `\n\n⬇️` appended.
 * - The last chunk gets `\n\n⬇️⬇️⬇️\n{utmLink}` appended.
 *
 * @param chunks - Raw unformatted chunks
 * @param utmLink - UTM-tagged article URL
 * @returns Formatted chunk strings ready for display/copy
 */
function formatChunks(chunks: string[], utmLink: string): string[] {
  return chunks.map((chunk, index) => {
    const isLast = index === chunks.length - 1

    if (isLast) {
      return chunk + '\n\n⬇️⬇️⬇️\n' + utmLink
    }

    return chunk + '\n\n⬇️'
  })
}

/**
 * Generate X (Twitter) content from an article.
 *
 * @param article - Extracted article data
 * @returns XContent with an array of formatted tweet chunks
 */
export function generateXContent(article: Article): XContent {
  const plainText = htmlToText(article.introduction)

  if (plainText === '') {
    return { chunks: [] }
  }

  const sentences = splitIntoSentences(plainText)
  const rawChunks = buildChunks(sentences)
  const utmLink = generateUTMLink(article.url, 'X')
  const chunks = formatChunks(rawChunks, utmLink)

  return { chunks }
}
