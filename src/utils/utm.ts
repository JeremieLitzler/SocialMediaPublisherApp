/**
 * UTM Tag Generator Utility
 *
 * Pure function for generating UTM-tagged URLs for social media tracking.
 * No Vue dependencies - can be used in any JavaScript environment.
 *
 * UTM Parameter Format:
 * - utm_medium: always 'social' for social media sharing
 * - utm_source: platform name (X, LinkedIn, Medium, Substack)
 *
 * Example output: https://example.com/article?utm_medium=social&utm_source=X
 */

import type { Platform } from '@/types/article'

/**
 * Generate a UTM-tagged URL for social media tracking
 *
 * @param url - Base article URL (can include existing query params and hash)
 * @param platform - Social media platform name
 * @returns URL with UTM parameters appended
 *
 * @example
 * ```ts
 * generateUTMLink('https://blog.com/article', 'X')
 * // Returns: 'https://blog.com/article?utm_medium=social&utm_source=X'
 *
 * generateUTMLink('https://blog.com/article?lang=en', 'LinkedIn')
 * // Returns: 'https://blog.com/article?lang=en&utm_medium=social&utm_source=LinkedIn'
 * ```
 */
export function generateUTMLink(url: string, platform: Platform): string {
  try {
    // Parse the URL to handle existing params and hash properly
    const urlObj = new URL(url)

    // Add UTM parameters
    urlObj.searchParams.set('utm_medium', 'social')
    urlObj.searchParams.set('utm_source', platform)

    return urlObj.toString()
  } catch (error) {
    // If URL parsing fails, fall back to simple string append
    // This shouldn't happen in normal use but provides graceful degradation
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}utm_medium=social&utm_source=${platform}`
  }
}
