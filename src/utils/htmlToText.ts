/**
 * HTML-to-plain-text conversion utility
 *
 * Pure function — no Vue dependencies.
 * Uses the browser DOMParser so it works only in browser environments.
 */

/**
 * Strip HTML tags from a string and return collapsed plain text.
 *
 * @param html - Raw HTML string (may contain multiple elements)
 * @returns Plain text with all tags removed, internal whitespace collapsed, and outer whitespace trimmed
 *
 * @example
 * ```ts
 * htmlToText('<p>Hello <strong>world</strong>!</p>')
 * // Returns: 'Hello world!'
 * ```
 */
export function htmlToText(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const rawText = doc.body.textContent ?? ''
  return rawText.replace(/\s+/g, ' ').trim()
}
