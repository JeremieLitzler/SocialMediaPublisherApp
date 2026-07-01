/**
 * Manual-introduction handling.
 *
 * The manual introduction is fully user-controlled plain text. Before it enters
 * shared state or content generation it is:
 *  - bounded to a maximum length (security-guidelines rule 3: guards against an
 *    unbounded paste degrading rendering/clipboard — a client-side DoS), and
 *  - HTML-escaped and wrapped in a single `<p>` so every angle-bracket sequence
 *    renders as literal text, never as active markup, on both the text platforms
 *    (X/LinkedIn text interpolation) and the preview platforms (Medium/Substack,
 *    where DOMPurify then runs) — security-guidelines rules 1 & 2.
 *
 * Wrapping in `<p>` also makes the plain-text introduction a single paragraph
 * block for `extractIntroductionBlocks`, which only iterates element children.
 *
 * Pure functions — no Vue dependencies.
 */

/** Maximum accepted length of a manually typed introduction, in characters. */
export const MAX_MANUAL_INTRODUCTION_LENGTH = 5000

/** Character-to-entity map used to neutralise user-supplied markup. */
const HTML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(value: string): string {
  return value.replaceAll(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character)
}

/** True when the text carries at least one non-whitespace character. */
export function hasVisibleCharacter(value: string): boolean {
  return value.trim().length > 0
}

/** Clamp a manual introduction to the accepted maximum length. */
export function boundManualIntroduction(value: string): string {
  return value.slice(0, MAX_MANUAL_INTRODUCTION_LENGTH)
}

/**
 * Convert a manually typed, plain-text introduction into introduction HTML:
 * bounded, HTML-escaped, and wrapped in a single paragraph.
 *
 * @param value - Raw text typed by the reader
 * @returns Introduction HTML safe to store in the retained article
 */
export function toIntroductionHtml(value: string): string {
  const bounded = boundManualIntroduction(value)
  return `<p>${escapeHtml(bounded)}</p>`
}
