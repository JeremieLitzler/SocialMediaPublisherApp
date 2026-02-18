/**
 * Article Extraction Composable
 *
 * Handles fetching and parsing blog article HTML to extract content.
 * Updates the shared article state with extraction results.
 */

import { useArticleState } from './useArticleState'
import {
  extractTitle,
  extractDescription,
  extractImageUrl,
  extractImageAlt,
  extractIntroduction,
  extractCategories,
  extractTags,
  extractFollowMeSnippet,
  extractImageCredit,
  detectBlog,
} from '@/utils/htmlExtractor'
import type { Article } from '@/types/article'

/**
 * Fetch HTML content from a URL via Netlify Function proxy
 */
async function fetchHTML(url: string): Promise<string> {
  const functionUrl = `/.netlify/functions/fetch-article?url=${encodeURIComponent(url)}`

  const response = await fetch(functionUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch article')
  }

  return data.html
}

/**
 * Parse HTML string into a Document object
 */
function parseHTML(html: string): Document {
  const parser = new DOMParser()
  return parser.parseFromString(html, 'text/html')
}

/**
 * Extract all article data from parsed HTML document
 */
function extractArticleData(doc: Document, url: string): Article {
  const introduction = extractIntroduction(doc)

  if (introduction === null) {
    throw new Error('MISSING_INTRODUCTION')
  }

  return {
    url,
    blog: detectBlog(url),
    title: extractTitle(doc),
    description: extractDescription(doc),
    imageUrl: extractImageUrl(doc),
    imageAlt: extractImageAlt(doc),
    imageCaption: null, // Not extracted from HTML (not in spec)
    introduction,
    category: extractCategories(doc),
    tags: extractTags(doc),
    followMeSnippet: extractFollowMeSnippet(doc),
    imageCreditSnippet: extractImageCredit(doc),
  }
}

/**
 * Composable for extracting article content from a URL
 *
 * @returns Object with extractArticle function
 */
export function useArticleExtractor() {
  const { extractionState } = useArticleState()

  /**
   * Extract article content from a given URL
   *
   * @param url - Blog article URL to extract from
   */
  async function extractArticle(url: string): Promise<void> {
    extractionState.value = {
      status: 'loading',
      article: null,
      error: null,
      manualIntroduction: '',
    }

    try {
      const html = await fetchHTML(url)
      const doc = parseHTML(html)
      const article = extractArticleData(doc, url)

      extractionState.value = {
        status: 'success',
        article,
        error: null,
        manualIntroduction: '',
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'MISSING_INTRODUCTION') {
        extractionState.value = {
          status: 'missing-introduction',
          article: null,
          error: 'No introduction found. The article must have paragraphs before the first <h2>.',
          manualIntroduction: '',
        }
        return
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred during extraction'

      extractionState.value = {
        status: 'error',
        article: null,
        error: errorMessage,
        manualIntroduction: '',
      }
    }
  }

  return {
    extractArticle,
  }
}
