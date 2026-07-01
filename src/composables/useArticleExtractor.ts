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
 * User-facing messages for each cause that lands extraction in the
 * `missing-introduction` state. Kept as fixed literals so no fetched HTML,
 * URL, or article text is ever interpolated into rendered copy
 * (see security-guidelines R1). The two causes carry distinct wording:
 * - NO_HEADING: no `<h2>` (or no `.article-content`), so the introduction
 *   boundary cannot be located — the author must add an `<h2>`.
 * - EMPTY: a first `<h2>` exists but no introduction precedes it — the author
 *   must add an introduction, or the user can enter one manually.
 */
const MISSING_INTRODUCTION_MESSAGES = {
  MISSING_INTRODUCTION_NO_HEADING:
    'The source article has no <h2> section heading, so the end of the introduction cannot be located. Update the source article to use <h2> for its section headings.',
  MISSING_INTRODUCTION_EMPTY:
    'The source article has no introduction before its first <h2> section heading. Add an introduction to the source article, or enter one manually below.',
} as const

type MissingIntroductionCode = keyof typeof MISSING_INTRODUCTION_MESSAGES

function isMissingIntroductionCode(value: string): value is MissingIntroductionCode {
  return Object.prototype.hasOwnProperty.call(MISSING_INTRODUCTION_MESSAGES, value)
}

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
    throw new Error('MISSING_INTRODUCTION_NO_HEADING')
  }
  if (introduction === '') {
    throw new Error('MISSING_INTRODUCTION_EMPTY')
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
      selectedPlatform: null,
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
        selectedPlatform: null,
      }
    } catch (error) {
      if (error instanceof Error && isMissingIntroductionCode(error.message)) {
        extractionState.value = {
          status: 'missing-introduction',
          article: null,
          error: MISSING_INTRODUCTION_MESSAGES[error.message],
          manualIntroduction: '',
          selectedPlatform: null,
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
        selectedPlatform: null,
      }
    }
  }

  return {
    extractArticle,
  }
}
