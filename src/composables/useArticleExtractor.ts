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
import type { Article, ExtractionState } from '@/types/article'

/**
 * User-facing messages for each cause that lands extraction in the
 * `missing-introduction` state. Kept as fixed literals so no fetched HTML,
 * URL, or article text is ever interpolated into rendered copy
 * (see security-guidelines). The two causes carry distinct wording:
 * - NO_HEADING: no `<h2>` (or no `.article-content`), so the introduction
 *   boundary cannot be located — the author must fix the source (no manual
 *   entry, see R4).
 * - EMPTY: a first `<h2>` exists but no introduction precedes it — the author
 *   must add an introduction, or the reader can enter one manually (R3).
 */
const MISSING_INTRODUCTION_MESSAGES = {
  NO_HEADING:
    'The source article has no <h2> section heading, so the end of the introduction cannot be located. Update the source article to use <h2> for its section headings.',
  EMPTY:
    'The source article has no introduction before its first <h2> section heading. Add an introduction to the source article, or enter one manually below.',
} as const

/**
 * Build an extraction state from partial overrides on top of the idle defaults.
 * Centralising the shape keeps every result (loading, success, missing, error)
 * consistent and avoids repeating the five fields at each transition.
 */
function makeState(overrides: Partial<ExtractionState>): ExtractionState {
  return {
    status: 'idle',
    article: null,
    error: null,
    manualIntroduction: '',
    selectedPlatform: null,
    ...overrides,
  }
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
 * Build the article from every non-introduction field plus the given
 * introduction. The introduction is supplied by the caller so an EMPTY result
 * can still retain the article with a blank introduction (R1).
 */
function buildArticle(doc: Document, url: string, introduction: string): Article {
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
 * Map the introduction outcome to an extraction state.
 * - null (no `.article-content`/`<h2>`) -> NO_HEADING, article discarded (R4).
 * - '' (first `<h2>` but nothing before it) -> EMPTY, article retained (R1/R3).
 * - non-empty -> success with the full article.
 */
function resolveExtractionState(
  doc: Document,
  url: string,
  introduction: string | null,
): ExtractionState {
  if (introduction === null) {
    return makeState({
      status: 'missing-introduction',
      error: MISSING_INTRODUCTION_MESSAGES.NO_HEADING,
    })
  }
  if (introduction === '') {
    return makeState({
      status: 'missing-introduction',
      article: buildArticle(doc, url, ''),
      error: MISSING_INTRODUCTION_MESSAGES.EMPTY,
    })
  }
  return makeState({ status: 'success', article: buildArticle(doc, url, introduction) })
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Unknown error occurred during extraction'
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
    extractionState.value = makeState({ status: 'loading' })

    try {
      const html = await fetchHTML(url)
      const doc = parseHTML(html)
      extractionState.value = resolveExtractionState(doc, url, extractIntroduction(doc))
    } catch (error) {
      extractionState.value = makeState({ status: 'error', error: toErrorMessage(error) })
    }
  }

  return {
    extractArticle,
  }
}
