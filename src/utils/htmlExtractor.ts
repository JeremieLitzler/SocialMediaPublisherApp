/**
 * HTML Extractor Utility
 *
 * Pure functions for extracting article content from blog HTML using DOM selectors.
 * No Vue dependencies - can be used in any JavaScript environment.
 *
 * Expected HTML structure:
 * - Title: `.article-title a`
 * - Description: `.article-subtitle`
 * - Image URL: `meta[name="twitter:image"]` content attribute
 * - Image alt: `.article-header .article-image a img`
 * - Introduction: all `<p>` tags before first `<h2>` in `.article-content`
 * - Categories: `<header class="article-category">` all `<a>` elements
 * - Tags: `<section class="article-tags">` all `<a>` elements
 * - Follow-me snippet: second-to-last child of `.article-content`
 * - Image credit: last `<p>` in `.article-content` if starts with "Photo by"/"Photo de"
 */

import type { Blog } from '@/types/article'

/**
 * Extract article title from .article-title a selector
 * @param doc - Parsed HTML document
 * @returns Article title or empty string if not found
 */
export function extractTitle(doc: Document): string {
  const titleElement = doc.querySelector('.article-title a')
  return titleElement?.textContent?.trim() || ''
}

/**
 * Extract article description from .article-subtitle selector
 * @param doc - Parsed HTML document
 * @returns Article description or empty string if not found
 */
export function extractDescription(doc: Document): string {
  const descElement = doc.querySelector('.article-subtitle')
  return descElement?.textContent?.trim() || ''
}

/**
 * Extract featured image URL from the twitter:image meta tag.
 *
 * The meta tag always contains the full absolute URL, unlike the
 * `.article-image a img` selector whose `src` can be a relative path
 * that resolves against the wrong base when parsed by DOMParser.
 *
 * @param doc - Parsed HTML document
 * @returns Full absolute image URL or empty string if not found
 */
export function extractImageUrl(doc: Document): string {
  const metaElement = doc.querySelector('meta[name="twitter:image"]')
  return metaElement?.getAttribute('content') || ''
}

/**
 * Extract featured image alt text
 * @param doc - Parsed HTML document
 * @returns Image alt text or empty string if not found
 */
export function extractImageAlt(doc: Document): string {
  const imgElement = doc.querySelector('.article-header .article-image a img') as HTMLImageElement | null
  return imgElement?.alt || ''
}

/**
 * Extract introduction paragraphs before first h2 in article content
 * Returns null if no h2 is found (invalid article structure)
 * @param doc - Parsed HTML document
 * @returns Introduction HTML string or null if no h2 found
 */
export function extractIntroduction(doc: Document): string | null {
  const articleContent = doc.querySelector('.article-content')
  if (!articleContent) return null

  const firstH2 = articleContent.querySelector('h2')
  if (!firstH2) return null // No h2 means no valid introduction structure

  const introParagraphs: string[] = []
  let currentElement = articleContent.firstElementChild

  while (currentElement && currentElement !== firstH2) {
    if (currentElement.tagName === 'P') {
      introParagraphs.push(currentElement.outerHTML)
    }
    currentElement = currentElement.nextElementSibling
  }

  return introParagraphs.join('')
}

/**
 * Extract all categories from article-category header
 * @param doc - Parsed HTML document
 * @returns Comma-separated category names or empty string if not found
 */
export function extractCategories(doc: Document): string {
  const categoryHeader = doc.querySelector('header.article-category')
  if (!categoryHeader) return ''

  const categoryLinks = categoryHeader.querySelectorAll('a')
  const categories = Array.from(categoryLinks)
    .map((link) => link.textContent?.trim() || '')
    .filter((cat) => cat !== '')

  return categories.join(', ')
}

/**
 * Extract all tags from article-tags section
 * @param doc - Parsed HTML document
 * @returns Array of tag names
 */
export function extractTags(doc: Document): string[] {
  const tagsSection = doc.querySelector('section.article-tags')
  if (!tagsSection) return []

  const tagLinks = tagsSection.querySelectorAll('a')
  return Array.from(tagLinks)
    .map((link) => link.textContent?.trim() || '')
    .filter((tag) => tag !== '')
}

/**
 * Extract "follow me" snippet from second-to-last child of article content
 * @param doc - Parsed HTML document
 * @returns Follow-me snippet HTML or empty string if not found
 */
export function extractFollowMeSnippet(doc: Document): string {
  const articleContent = doc.querySelector('.article-content')
  if (!articleContent) return ''

  const children = Array.from(articleContent.children)
  if (children.length < 2) return ''

  const secondToLast = children[children.length - 2]
  return secondToLast?.outerHTML || ''
}

/**
 * Extract image credit from last paragraph in article content
 * Only returns text if it starts with "Photo by" (EN) or "Photo de" (FR)
 * @param doc - Parsed HTML document
 * @returns Image credit text or null if not present
 */
export function extractImageCredit(doc: Document): string | null {
  const articleContent = doc.querySelector('.article-content')
  if (!articleContent) return null

  const paragraphs = articleContent.querySelectorAll('p')
  if (paragraphs.length === 0) return null

  const lastP = paragraphs[paragraphs.length - 1]
  const text = lastP.textContent?.trim() || ''

  if (text.startsWith('Photo by') || text.startsWith('Photo de')) {
    return text
  }

  return null
}

/**
 * Detect blog language from URL domain
 * @param url - Article URL
 * @returns 'english' if iamjeremie.me, 'french' if jeremielitzler.fr
 */
export function detectBlog(url: string): Blog {
  if (url.includes('iamjeremie.me')) {
    return 'english'
  }
  if (url.includes('jeremielitzler.fr')) {
    return 'french'
  }
  // Default to english if domain doesn't match
  return 'english'
}
