/**
 * Shared HTML-building utilities for platform content generators.
 *
 * Centralises the figure HTML builder, the visual separator constant,
 * and the paragraph-extraction helper that were previously duplicated
 * across mediumContentGenerator.ts, substackContentGenerator.ts,
 * linkedInContentGenerator.ts, and xContentGenerator.ts.
 */

import type { Article, IntroductionBlock } from '@/types/article'
import { htmlToText } from './htmlToText'

/**
 * Visual separator used at the end of content blocks to indicate
 * that the full article is available at the linked URL.
 */
export const VISUAL_SEPARATOR = '⬇️⬇️⬇️'

/**
 * Build a `<figcaption>` element from an image credit HTML snippet.
 * Returns an empty string when no credit is present.
 *
 * @param imageCreditSnippet - Raw HTML string starting with "Photo by"/"Photo de", or null
 * @returns Figcaption HTML string or empty string
 */
export function buildFigcaption(imageCreditSnippet: string | null): string {
  if (imageCreditSnippet === null) return ''
  return `<figcaption>${htmlToText(imageCreditSnippet)}</figcaption>`
}

/**
 * Build a `<figure>` element containing the article's featured image
 * and an optional figcaption derived from the image credit snippet.
 *
 * @param article - Extracted article data
 * @returns Figure HTML string
 */
export function buildFigureHtml(article: Article): string {
  const imgTag = `<img src="${article.imageUrl}" alt="${article.imageAlt}" />`
  const figcaption = buildFigcaption(article.imageCreditSnippet)
  return `<figure>${imgTag}${figcaption}</figure>`
}

/**
 * Extract plain-text paragraphs from an HTML string.
 *
 * Uses DOMParser to safely parse the HTML. Each `<p>` element
 * becomes one entry in the returned array. Internal whitespace
 * within each paragraph is collapsed to a single space.
 * Empty paragraphs are excluded.
 *
 * @param html - Raw HTML string containing `<p>` elements
 * @returns Array of trimmed, whitespace-collapsed, non-empty paragraph strings
 */
export function extractParagraphTexts(html: string): string[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const paragraphNodes = doc.querySelectorAll('p')
  const texts: string[] = []

  for (const node of paragraphNodes) {
    const text = (node.textContent ?? '').replaceAll(/\s+/g, ' ').trim()
    if (text.length > 0) texts.push(text)
  }

  return texts
}

/**
 * Tags that begin a new visual line when flattening a block element's text.
 * Used by `elementLines` so blockquotes split correctly whether their lines
 * come from separate `<p>` children or `<br>`-separated text.
 */
const LINE_BREAK_TAGS = new Set(['P', 'DIV', 'LI', 'BLOCKQUOTE'])

/** Collapse all runs of whitespace to a single space and trim the ends. */
function collapseWhitespace(value: string): string {
  return value.replaceAll(/\s+/g, ' ').trim()
}

/**
 * Parse introduction HTML and strip active elements.
 *
 * `script`/`style` nodes are removed so their inner text never leaks into the
 * plain-text output (security guideline 1 / 2): blocks are built from the
 * remaining DOM text content, not from raw markup.
 */
function parseIntroductionHtml(html: string): Document {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  for (const node of Array.from(doc.querySelectorAll('script, style'))) {
    node.remove()
  }
  return doc
}

/** Concatenate a node's text, inserting `\n` at `<br>` and block boundaries. */
function nodeText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
  if (node.nodeType !== Node.ELEMENT_NODE) return ''
  return elementInlineText(node as Element)
}

/** Flatten an element to text, marking `<br>`/block boundaries with `\n`. */
function elementInlineText(element: Element): string {
  if (element.tagName === 'BR') return '\n'
  const inner = childrenText(element)
  if (LINE_BREAK_TAGS.has(element.tagName)) return `\n${inner}\n`
  return inner
}

/** Flatten all child nodes of an element to text with line breaks. */
function childrenText(element: Element): string {
  let result = ''
  for (const child of Array.from(element.childNodes)) {
    result += nodeText(child)
  }
  return result
}

/** Split a block element into its non-empty, whitespace-collapsed lines. */
function elementLines(element: Element): string[] {
  return childrenText(element)
    .split('\n')
    .map((line) => collapseWhitespace(line))
    .filter((line) => line.length > 0)
}

/** Collect non-empty, collapsed text of a list's direct `<li>` children. */
function listItemTexts(list: Element): string[] {
  const items: string[] = []
  for (const child of Array.from(list.children)) {
    if (child.tagName !== 'LI') continue
    const text = collapseWhitespace(child.textContent ?? '')
    if (text.length > 0) items.push(text)
  }
  return items
}

/** Wrap pre-formatted lines into a non-paragraph block, or null when empty. */
function joinedBlock(lines: string[]): IntroductionBlock | null {
  if (lines.length === 0) return null
  return { text: lines.join('\n'), isParagraph: false }
}

function paragraphBlock(element: Element): IntroductionBlock | null {
  const text = collapseWhitespace(element.textContent ?? '')
  if (text.length === 0) return null
  return { text, isParagraph: true }
}

function unorderedListBlock(element: Element): IntroductionBlock | null {
  return joinedBlock(listItemTexts(element).map((item) => `- ${item}`))
}

function orderedListBlock(element: Element): IntroductionBlock | null {
  return joinedBlock(listItemTexts(element).map((item, index) => `${index + 1}. ${item}`))
}

function blockquoteBlock(element: Element): IntroductionBlock | null {
  return joinedBlock(elementLines(element).map((line) => `> ${line}`))
}

/** A `<pre>` or `<div class="highlight">` carries a fenced code block. */
function isCodeBlock(element: Element): boolean {
  if (element.tagName === 'PRE') return true
  return element.tagName === 'DIV' && element.classList.contains('highlight')
}

/**
 * Remove leading blank lines and trailing whitespace while preserving the
 * code's internal line breaks and indentation. Both regexes use a single
 * non-nested quantifier, so they run in linear time (security guideline 3).
 */
function stripOuterBlankLines(code: string): string {
  return code.replace(/^[\r\n]+/, '').replace(/\s+$/, '')
}

function codeBlock(element: Element): IntroductionBlock | null {
  const raw = element.textContent ?? ''
  if (raw.length === 0) return null
  const code = stripOuterBlankLines(raw)
  return { text: '```\n' + code + '\n```', isParagraph: false }
}

/** Map of block tags to their builder; code blocks are matched separately. */
const BLOCK_BUILDERS: Record<string, (element: Element) => IntroductionBlock | null> = {
  P: paragraphBlock,
  UL: unorderedListBlock,
  OL: orderedListBlock,
  BLOCKQUOTE: blockquoteBlock,
}

function elementToBlock(element: Element): IntroductionBlock | null {
  const builder = BLOCK_BUILDERS[element.tagName]
  if (builder) return builder(element)
  if (isCodeBlock(element)) return codeBlock(element)
  return null
}

/**
 * Convert introduction HTML into ordered plain-text blocks for LinkedIn and X.
 *
 * Each top-level introduction element (`<p>`, `<ul>`, `<ol>`, `<blockquote>`,
 * `<pre>`, `<div class="highlight">`) becomes one {@link IntroductionBlock} in
 * source order. Paragraphs collapse internal whitespace; lists, blockquotes,
 * and code blocks carry their per-type formatting. Empty blocks are omitted.
 *
 * @param html - Introduction HTML (concatenated top-level intro elements)
 * @returns Ordered array of non-empty rendered blocks
 */
export function extractIntroductionBlocks(html: string): IntroductionBlock[] {
  const doc = parseIntroductionHtml(html)
  const body = doc.body
  if (!body) return []
  const blocks: IntroductionBlock[] = []
  for (const element of Array.from(body.children)) {
    const block = elementToBlock(element)
    if (block !== null) blocks.push(block)
  }
  return blocks
}
